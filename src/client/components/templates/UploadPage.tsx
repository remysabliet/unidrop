import React, { useState, useEffect, useCallback } from 'react';

import { FileUpload } from 'C/components/organisms';

import type { UploadResponse } from 'C/types/api';

import { fileService } from 'C/services/fileUpload';
import { CONFIGS } from 'C/configs/config';

export const UploadPage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /**
   * Fetches uploaded files using the service function.
   */
  const fetchFiles = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const files = await fileService.getUploadedFiles();
      setUploadedFiles(files);
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
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-center text-purple-700 mb-8">File Upload</h1>
      <div className="max-w-xl mx-auto">
        <FileUpload
          onUploadComplete={fetchFiles}
          maxAllowedFiles={CONFIGS.maxAllowedFiles}
          acceptedFileTypes={CONFIGS.acceptedFileTypes}
          maxTotalSize={CONFIGS.uploadTotalSize}
        />
       
      </div>

      {/* Render the gallery if files have been fetched */}
      {uploadedFiles.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Uploaded Files</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow duration-200"
              >
                {file.url ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center bg-gray-200 rounded-md mb-3">
                    <span className="text-gray-500">No Preview</span>
                  </div>
                )}
                <p className="text-lg font-medium truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display loading and error messages */}
      {isLoading && (
        <div className="mt-4 text-center text-gray-600">Loading files...</div>
      )}
      {fetchError && (
        <div className="mt-4 text-center text-red-500">{fetchError}</div>
      )}
    </div>
  );
};
