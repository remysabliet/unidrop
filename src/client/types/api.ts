import type { FileItem } from 'C/types/file';

export interface FetchFilesResponse {
  files: FileItem[];
}

export interface UploadedFileResponse {
  message: string;
}

