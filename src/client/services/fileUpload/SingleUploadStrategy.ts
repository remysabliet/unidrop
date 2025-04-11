import type { FileItem } from 'C/types';

import type { ProgressCallback, UploadStrategy } from "./fileUploadTypes";

/**
 * SingleUploadStrategy handles the upload of small files in one go.
 */
export class SingleUploadStrategy implements UploadStrategy {
  constructor(private readonly uploadUrl: string) { }

  public upload(file: File, onProgress?: ProgressCallback): Promise<FileItem> {
    return new Promise((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.uploadUrl);

        xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
          if (event.lengthComputable && onProgress) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const responseData: FileItem = JSON.parse(xhr.responseText);
              resolve(responseData);
            } catch (parseError) {
              reject(new Error('Failed to parse server response'));
            }
          } else {
            reject(
              new Error(
                `Upload failed with status: ${xhr.status}. Response: ${xhr.responseText}`
              )
            );
          }
        };

        xhr.onerror = () =>
          reject(new Error('Network error occurred during file upload'));
        xhr.ontimeout = () => reject(new Error('Upload request timed out'));

        const formData = new FormData();
        formData.append('file', file);
        xhr.send(formData);
      } catch (error) {
        reject(
          new Error(
            error instanceof Error
              ? error.message
              : 'An unknown error occurred during file upload'
          )
        );
      }
    });
  }
}