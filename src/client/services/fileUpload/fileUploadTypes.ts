import type { FileItem } from 'C/types';

// A callback type for progress reporting.
export type ProgressCallback = (progress: number) => void;

/**
 * IUploadStrategy is the interface that any upload strategy must implement.
 */
export interface UploadStrategy {
  upload(file: File, onProgress?: ProgressCallback): Promise<FileItem>;
}
