import React from 'react';

import type { FileItem } from 'C/types';

import { formatFileSize } from 'C/utils/file';

interface FileListItemProps {
  file: FileItem;
}

/**
 * A child component to render a single file row, displaying the file name and size.
 *
 * @param {FileItem} props.file - The file object containing details about the file.
 * @returns {JSX.Element} - A JSX element representing a single file row.
 */
export const FileListItem: React.FC<FileListItemProps> = ({ file }) => {
  return (
    <div className="grid grid-cols-2 py-1 border-b last:border-0">
      <span className="truncate">{file.name}</span>
      <span className="truncate text-right">{formatFileSize(file.size)}</span>
    </div>
  );
};