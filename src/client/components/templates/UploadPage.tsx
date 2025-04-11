import React, { useState, useEffect, useCallback } from 'react';

import { FileList } from 'C/components/molecules';
import { FileUpload } from 'C/components/organisms';

import type { FileItem, FetchFilesResponse } from 'C/types';

import { fileService } from 'C/services/fileUpload';
import { CONFIGS } from 'C/configs/config';

export const UploadPage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /**
   * Fetches uploaded files using the service function.
   */
  const fetchFiles = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res: FetchFilesResponse = await fileService.getUploadedFiles();
      setUploadedFiles(res.files);
    } catch (error: any) {
      setFetchError(error.message || 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch the uploaded files once when the component mounts.
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="max-h-[80vh] overflow-y-auto container mx-auto p-8">
      <h1 className="text-3xl font-bold text-center text-purple-700 mb-8">File Upload</h1>
      <div className="max-w-xl mx-auto">
        <FileUpload
          onUploadComplete={fetchFiles}
          maxAllowedFiles={CONFIGS.maxAllowedFiles}
          acceptedFileTypes={CONFIGS.acceptedFileTypes}
          maxTotalSize={CONFIGS.uploadTotalSize}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center mt-10">
          <div className="loader border-t-4 border-purple-700 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      ) : fetchError ? (
        <div className="text-center text-red-500 mt-10">{fetchError}</div>
      ) : (
        uploadedFiles.length > 0 && (
          <div className="mt-10">
            <FileList files={uploadedFiles} />
          </div>
        )
      )}
    </div>
  );
};