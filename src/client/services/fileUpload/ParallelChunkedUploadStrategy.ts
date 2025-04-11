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

  public async upload(file: File, onProgress?: ProgressCallback): Promise<FileItem> {
    const totalChunks = Math.ceil(file.size / this.chunkSize);
    const progressArray = new Array<number>(totalChunks).fill(0);

    console.debug(
      `Uploading file: ${file.name}, size: ${file.size} bytes, chunk size: ${this.chunkSize} bytes, total chunks: ${totalChunks}`)

    const updateProgress = () => {
      const totalUploaded = progressArray.reduce((sum, uploaded) => sum + uploaded, 0);
      if (onProgress) {
        onProgress(Math.min((totalUploaded / file.size) * 100, 100));
      }
    };

    // Create a task for each chunk.
    const tasks: Array<() => Promise<FileItem>> = [];
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      tasks.push(() => {
        const start = chunkIndex * this.chunkSize;
        const end = Math.min(file.size, start + this.chunkSize);
        const chunk = file.slice(start, end);

        return new Promise<FileItem>((resolve, reject) => {
          try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.uploadUrl);

            xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
              if (event.lengthComputable) {
                progressArray[chunkIndex] = event.loaded;
                updateProgress();
              }
            };

            xhr.onload = () => {
              if (xhr.status === 200) {
                try {
                  const responseData: FileItem = JSON.parse(xhr.responseText);
                  resolve(responseData);
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

            xhr.onerror = () =>
              reject(new Error('Network error occurred during chunk upload'));
            xhr.ontimeout = () => reject(new Error('Chunk upload request timed out'));

            const formData = new FormData();
            formData.append('file', chunk, file.name);
            formData.append('currentChunkIndex', chunkIndex.toString());
            formData.append('totalChunks', totalChunks.toString());
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
    // Return the response from the final chunk upload (commonly includes merge status).
    return results[results.length - 1];
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
      if (executing.length >= limit) r = Promise.race(executing);
      return r.then(() => enqueue());
    };

    await enqueue();
    await Promise.all(executing);
    return results;
  }
}