import * as React from "react";

import { Button, ErrorMessage } from "C/components/atoms";

import type { UploadResponse } from "C/types/api";

import useFileUploader from "C/hooks/useFileUploader";

import { cn } from "C/utils";

import FileIcon from 'assets/fileUpload.svg?react';

export interface FileUploadProps {
  maxAllowedFiles?: number;
  acceptedFileTypes?: string; // Comma-separated list of allowed file types
  maxTotalSize?: number; // in bytes
  /**
   * Callback invoked when upload is complete.
   * Returns an array of upload responses from the upload service.
   */
  onUploadComplete?: (files: UploadResponse[]) => void;
  renderErrorMessage?: (error: string) => React.ReactNode;
  renderUploadButton?: () => React.ReactNode;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  acceptedFileTypes,
  maxAllowedFiles,
  maxTotalSize,
  onUploadComplete,
  renderErrorMessage,
  renderUploadButton
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Destructure the necessary state and handlers from our uploader hook.
  const {
    files,
    progress,
    error,
    isUploading,
    handleFilesSelected: hookHandleFilesSelected,
    handleDragOver,
    handleDragLeave,
    handleDrop: hookHandleDrop,
  } = useFileUploader({ onUploadComplete, maxAllowedFiles, acceptedFileTypes, maxTotalSize });



  return (
    <div
      className={cn(
        "relative min-h-[200px] p-4 border-2 border-dashed border-purple-300 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background group",
        isUploading && "opacity-75"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={hookHandleDrop}
      role="button"
      tabIndex={0}
      aria-label={`File upload area. ${files.length > 0 ? `1 file uploaded: ${files[0].name}.` : "Drag and drop a file here or click to select one file."}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={!!maxAllowedFiles && maxAllowedFiles > 1}
        accept={acceptedFileTypes}
        className="hidden"
        onChange={hookHandleFilesSelected}
        aria-hidden="true"
        data-testid="file-input"
      />

      {!isUploading && (
        <div className="flex flex-col items-center gap-4 ">
          <FileIcon className="w-16 h-16 text-purple-400 transition-transform duration-300 group-hover:scale-110" />
          {renderUploadButton
            ? renderUploadButton()
            : (
              <Button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="mb-4"
              >
                Upload Files
              </Button>
            )}
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm z-10 rounded-xl px-4 text-center">
          <div className="text-sm text-muted-foreground mb-2 truncate max-w-xs">
            Uploading file: <strong>{files[0]?.name}</strong>
          </div>
          <div className="text-2xl font-semibold text-purple-600">
            {Math.round(progress)}%
          </div>
        </div>
      )}

      {(error) && (
        renderErrorMessage
          ? renderErrorMessage(error || "An unknown error occurred")
          : <ErrorMessage message={error || "An unknown error occurred"} />
      )}

      {!isUploading && <p className="mt-3 text-xs text-gray-500">
        Drag and drop file here, or click the button above to select your file.
      </p>
      }
    </div>
  );
};

FileUpload.displayName = "FileUpload";