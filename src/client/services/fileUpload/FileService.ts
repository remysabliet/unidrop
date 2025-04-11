import type { FetchFilesResponse } from 'C/types';
import type { UploadStrategy, ProgressCallback } from '.';

import { SingleUploadStrategy } from './SingleUploadStrategy'
import { ParallelChunkedUploadStrategy } from './ParallelChunkedUploadStrategy'
import { CONFIGS } from 'C/configs/config';

/**
 * FileService coordinates file uploads and file retrieval.
 * It selects the appropriate upload strategy based on the file size.
 */
export class FileService {
  private readonly singleThreshold: number;
  constructor(
    private readonly singleStrategy: UploadStrategy,
    private readonly chunkStrategy: UploadStrategy,
    private readonly fileListUrl: string,
    singleThreshold: number = 5 * 1024 * 1024 // Can be configurable.
  ) {
    this.singleThreshold = singleThreshold;
  }

  public uploadFile(file: File, onProgress?: ProgressCallback): Promise<any> {
    if (file.size > this.singleThreshold) {
      return this.chunkStrategy.upload(file, onProgress);
    } else {
      return this.singleStrategy.upload(file, onProgress);
    }
  }

  public async getUploadedFiles(): Promise<FetchFilesResponse> {
    try {
      const response = await fetch(this.fileListUrl);
      if (!response.ok) {
        throw new Error(`Error fetching files: ${response.statusText}`);
      }
      return (await response.json()) as FetchFilesResponse;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'An unknown error occurred while fetching files'
      );
    }
  }
}

// Creating a singleton instance using the configurations.
const singleUploadUrl = CONFIGS.beApiBaseUrl + CONFIGS.singleFileUploadPath;
const chunkUploadUrl = CONFIGS.beApiBaseUrl + CONFIGS.chunkFileUploadPath;
const fileListUrl = CONFIGS.beApiBaseUrl + CONFIGS.fileListPath;

export const fileService = new FileService(
  new SingleUploadStrategy(singleUploadUrl),
  new ParallelChunkedUploadStrategy(chunkUploadUrl, CONFIGS.chunkSizeBytes, CONFIGS.parallelChunkCount),
  fileListUrl
);