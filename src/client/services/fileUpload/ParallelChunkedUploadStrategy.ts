import type { FileItem } from 'C/types';
import type { ProgressCallback, UploadStrategy } from "./fileUploadTypes";

/**
 * ParallelChunkedUploadStrategy handles large file uploads by splitting the file
 * into chunks and uploading them in parallel with a configurable concurrency limit.
 */
export class ParallelChunkedUploadStrategy implements UploadStrategy {
  constructor(
    private readonly uploadUrl: string,
    private readonly chunkSize: number = 5 * 1024 * 1024,
    private readonly parallelLimit: number = 3
  ) { }

  private generateFileId(file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }

  public async upload(file: File, onProgress?: ProgressCallback): Promise<FileItem> {
    const totalChunks = Math.ceil(file.size / this.chunkSize);
    const fileId = this.generateFileId(file);
    // Keep track of the number of bytes uploaded of each chunk.
    const progressArray = new Array<number>(totalChunks).fill(0);

    // Step 1: Ask backend which chunks already exist
    const uploadedChunks = new Set<number>();
    try {
      const res = await fetch(`${this.uploadUrl}/status?fileId=${encodeURIComponent(fileId)}`);
      if (res.ok) {
        const data = await res.json();
        for (const index of data.uploadedChunks) {
          uploadedChunks.add(index);
          progressArray[index] = this.chunkSize; // mark full progress
        }
        onProgress?.(Math.min((progressArray.reduce((a, b) => a + b, 0) / file.size) * 100, 100));
      }
    } catch (err) {
      console.warn('Could not fetch uploaded chunk status. Proceeding with full upload.');
    }

    console.debug(
      `Uploading file: ${file.name}, size: ${file.size} bytes, chunk size: ${this.chunkSize} bytes, total chunks: ${totalChunks}`)

    const updateProgress = () => {
      const totalUploaded = progressArray.reduce((sum, uploaded) => sum + uploaded, 0);
      if (onProgress) {
        onProgress(Math.min((totalUploaded / file.size) * 100, 100));
      }
    };

    // Create a task for each chunk.
    const tasks: Array<() => Promise<{ index: number; response: any }>> = [];
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      if (uploadedChunks.has(chunkIndex)) continue; // skip already uploaded
      tasks.push(() => {
        const start = chunkIndex * this.chunkSize;
        const end = Math.min(file.size, start + this.chunkSize);
        const chunk = file.slice(start, end);

        return new Promise<{ index: number; response: any }>((resolve, reject) => {
          try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.uploadUrl);

            // Track upload progress for this specific chunk
            xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
              if (event.lengthComputable) {
                // Save uploaded bytes in progress array and update overall progress
                progressArray[chunkIndex] = event.loaded;
                updateProgress();
              }
            };

            // Called when the upload completes successfully
            xhr.onload = () => {
              if (xhr.status === 200) {
                try {
                  // Parse and resolve the server response
                  const responseData = JSON.parse(xhr.responseText);
                  resolve({ index: chunkIndex, response: responseData });
                } catch (parseError) {
                  reject(new Error('Failed to parse server response on chunk upload'));
                }
              } else {
                reject(
                  new Error(
                    `Chunk upload failed with status: ${xhr.status}. Response: ${xhr.responseText}`
                  )
                );
              }
            };

            // Handle network errors
            xhr.onerror = () =>
              reject(new Error('Network error occurred during chunk upload'));
            // Handle timeout errors

            xhr.ontimeout = () => reject(new Error('Chunk upload request timed out'));

            // Build the form data for the request
            const formData = new FormData();
            formData.append('file', chunk, file.name);
            formData.append('currentChunkIndex', chunkIndex.toString());
            formData.append('totalChunks', totalChunks.toString());
            formData.append('fileId', fileId); // Include fileId in body for backend

            xhr.send(formData);
          } catch (error) {
            reject(
              new Error(
                error instanceof Error
                  ? error.message
                  : 'An unknown error occurred during chunk upload'
              )
            );
          }
        });
      });
    }

    // Execute tasks with a concurrency limit.
    const results = await this.executeWithConcurrency(tasks, this.parallelLimit);
    
    // Check if we have a completed file response
    for (const result of results) {
      if (result.response.status === 'complete') {
        return {
          name: file.name,
          size: file.size
        };
      }
    }
    
    // If we don't have a complete status, check if all chunks were uploaded
    const finishedChunks = new Set<number>([...uploadedChunks]);
    results.forEach(result => finishedChunks.add(result.index));
    
    if (finishedChunks.size === totalChunks) {
      // All chunks completed, but server might still be merging
      return { name: file.name, size: file.size };
    } else {
      throw new Error('Upload incomplete - not all chunks were processed');
    }
  }

  /**
   * Executes asynchronous tasks in parallel with a given concurrency limit.
   */
  private async executeWithConcurrency<T>(
    tasks: Array<() => Promise<T>>,
    limit: number
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];
    let index = 0;

    const enqueue = (): Promise<void> => {
      if (index === tasks.length) return Promise.resolve();
      const currentIndex = index++;
      const taskPromise = tasks[currentIndex]().then((result) => {
        results[currentIndex] = result;
      });

      const e = taskPromise.then(() => {
        executing.splice(executing.indexOf(e), 1);
      });

      executing.push(e);

      let r: Promise<void> = Promise.resolve();
      if (executing.length >= limit) {
        r = Promise.race(executing);
      }
      return r.then(() => enqueue());
    };

    await enqueue();
    await Promise.all(executing);
    return results;
  }
}