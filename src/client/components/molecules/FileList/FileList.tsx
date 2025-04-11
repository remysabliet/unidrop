import React from 'react';

import { FileListItem } from './FileListeItem'

import type { FileItem } from 'C/types';

export interface FileListProps {
  files: FileItem[];
}

export const FileList: React.FC<FileListProps> = ({ files }) => {
  if (files.length === 0) {
    return <p className="text-center text-gray-500">No files uploaded yet.</p>;
  }

  return (
    <div className="max-h-64 overflow-y-auto border rounded p-2 bg-white text-gray-800">
      {/* Header row */}
      <div className="grid grid-cols-2 font-semibold border-b pb-2">
        <div>Name</div>
        <div className="text-right">Size</div>
      </div>

      {/* Files rows */}
      {files.map((file, index) => (<FileListItem key={`${file.name}-${index}`} file={file} />))}

    </div>
  );
};
