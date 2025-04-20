import { readFile, readdir, unlink } from 'node:fs/promises';
import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import stream from 'node:stream';
import { promisify } from 'node:util';

const pipeline = promisify(stream.pipeline);

export interface ChunkManagerConfig {
  uploadDir: string;
  chunkDir: string;
}

export class ChunkManager {
  private uploadDir: string;
  private chunkDir: string;

  constructor(config: ChunkManagerConfig) {
    this.uploadDir = config.uploadDir;
    this.chunkDir = config.chunkDir;

    // Ensure directories exist
    if (!existsSync(this.chunkDir)) {
      mkdirSync(this.chunkDir, { recursive: true });
    }

    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Saves a chunk to the chunk directory
   */
  async saveChunk(fileStream: NodeJS.ReadableStream, fileName: string, chunkIndex: number): Promise<void> {
    const chunkFilePath = this.getChunkPath(fileName, chunkIndex);
    await pipeline(fileStream, createWriteStream(chunkFilePath));
  }

  /**
   * Get the complete list of chunks for a file
   */
  async getUploadedChunks(fileName: string): Promise<number[]> {
    try {
      const filePattern = new RegExp(`^${this.escapeRegExp(fileName)}\\.part_(\\d+)$`);
      const files = await readdir(this.chunkDir);

      const uploadedChunks: number[] = [];
      for (const file of files) {
        const match = file.match(filePattern);
        if (match) {
          uploadedChunks.push(parseInt(match[1], 10));
        }
      }

      return uploadedChunks;
    } catch (error) {
      console.error('Error getting uploaded chunks:', error);
      return [];
    }
  }

  /**
   * Check if all chunks for a file are uploaded
   */
  async areAllChunksUploaded(fileName: string, totalChunks: number): Promise<boolean> {
    const uploadedChunks = await this.getUploadedChunks(fileName);

    if (uploadedChunks.length !== totalChunks) {
      return false;
    }

    // Verify we have all chunks from 0 to totalChunks-1
    for (let i = 0; i < totalChunks; i++) {
      if (!uploadedChunks.includes(i)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Merge all chunks into a single file
   */
  async mergeChunks(fileName: string, totalChunks: number): Promise<void> {
    const filePath = join(this.uploadDir, fileName);
    const writeStream = createWriteStream(filePath);

    try {
      for (let i = 0; i < totalChunks; i++) {
        const chunkFilePath = this.getChunkPath(fileName, i);
        const chunkBuffer = await readFile(chunkFilePath);
        writeStream.write(chunkBuffer);
      }

      // Close the write stream properly
      await new Promise<void>((resolve, reject) => {
        writeStream.end(err => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Clean up chunks after successful merge
      await this.cleanupChunks(fileName, totalChunks);
    } catch (error) {
      // Close the stream in case of error
      writeStream.end();
      throw error;
    }
  }

  /**
   * Delete all chunks for a file
   */
  async cleanupChunks(fileName: string, totalChunks: number): Promise<void> {
    for (let i = 0; i < totalChunks; i++) {
      const chunkFilePath = this.getChunkPath(fileName, i);
      if (existsSync(chunkFilePath)) {
        await unlink(chunkFilePath);
      }
    }
  }

  /**
   * Get the path for a specific chunk
   */
  private getChunkPath(fileName: string, chunkIndex: number): string {
    return join(this.chunkDir, `${fileName}.part_${chunkIndex}`);
  }

  /**
   * Escape special regex characters in a string
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}