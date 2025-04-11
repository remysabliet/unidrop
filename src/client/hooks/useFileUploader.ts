import { useState, useCallback } from 'react';

import type { UploadedFileResponse } from 'C/types/api';

import { useDragAndDrop } from '.';

import { fileService } from 'C/services/fileUpload';
import { validateFiles, parseUploadError } from 'C/utils';

export interface FileUploaderOptions {
  maxAllowedFiles?: number;
  acceptedFileTypes?: string; // Comma-separated list of allowed file types
  maxTotalSize?: number; // in bytes
  onUploadComplete?: () => void;
}

export interface UseFileUploaderReturn {
  files: File[];
  progress: number;
  isUploading: boolean;
  error: string | null;
  handleFilesSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  retryUpload: () => void;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * useFileUploader
 *
 * This hook encapsulates file upload logic, including progress reporting,
 * error handling, drag and drop support, and file type validation.
 */
const useFileUploader = ({
  onUploadComplete,
  maxAllowedFiles,
  acceptedFileTypes,
  maxTotalSize,
}: FileUploaderOptions): UseFileUploaderReturn => {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Uploads a list of files sequentially. If multiple files are selected,
   * we enforce a maximum file count limit.
   */
  const uploadFiles = useCallback(
    async (selectedFiles: FileList) => {
      setError(null);
      setIsUploading(true);
      setProgress(0);
      const fileArray = Array.from(selectedFiles).slice(0, maxAllowedFiles);

      const errorMsg = validateFiles({
        files: selectedFiles,
        acceptedFileTypes,
        maxAllowedFiles,
        maxTotalSize,
      });

      if (errorMsg) {
        setError(errorMsg);
        setIsUploading(false);
        return;
      }

      setFiles(fileArray);
      const uploadResponses: UploadedFileResponse[] = [];

      try {
        for (const file of fileArray) {
          // Here fileService.uploadFile will decide if it should be sent in chunks or not
          const response = await fileService.uploadFile(file, (prog: number) => {
            setProgress(prog);
          });
          uploadResponses.push(response);
        }
        if (onUploadComplete) {
          onUploadComplete();
        }
      } catch (uploadError) {
        const errorMessage = parseUploadError(uploadError);
        setError(errorMessage);

      } finally {
        setIsUploading(false);
      }
    },
    [maxAllowedFiles, onUploadComplete]
  );

  /**
   * Handle file input change event with validation.
   */
  const handleFilesSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        uploadFiles(e.target.files);
      }
    },
    [uploadFiles]
  );

  /**
   * Handle drop event with file type validation.
   */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  /**
   * Retry uploading the files currently stored in state.
   */
  const retryUpload = useCallback(() => {
    setError(null);
    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      files.forEach((file) => dataTransfer.items.add(file));
      uploadFiles(dataTransfer.files);
    }
  }, [files, uploadFiles]);

  return {
    files,
    progress,
    isUploading,
    error,
    handleFilesSelected,
    handleDragOver: useDragAndDrop().handleDragOver,
    handleDragLeave: useDragAndDrop().handleDragLeave,
    handleDrop,
    retryUpload,
    setError,
  };
};

export default useFileUploader;
