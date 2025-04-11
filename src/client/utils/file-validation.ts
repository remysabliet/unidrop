/**
 * Validates if a file's type matches any of the allowed types.
 *
 * @param {File} file - The file to validate.
 * @param {string[]} allowedTypes - An array of allowed MIME types or type prefixes (e.g., "image/*").
 * @returns {boolean} - Returns `true` if the file type is valid, otherwise `false`.
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  for (const allowedType of allowedTypes) {
    if (allowedType.endsWith("/*")) {
      const prefix = allowedType.slice(0, -1);
      if (file.type.startsWith(prefix)) {
        return true;
      }
    } else if (file.type === allowedType) {
      return true;
    }
  }
  return false;
};

/**
 * Parses an upload error and returns a user-friendly error message.
 *
 * @param {unknown} error - The error object to parse.
 * @returns {string} - A user-friendly error message.
 */
export const parseUploadError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('File too large')) {
      return 'File too large';
    } else if (error.message.includes('<pre>')) {
      const match = error.message.match(/<pre>(.*?)<\/pre>/);
      if (match && match[1]) return match[1].split('<br>')[0];
    } else if (error.message.includes('Error saving chunk')) {
      return 'Server error while saving a file chunk. Please try again or contact support.';
    } else {
      return error.message;
    }
  }
  return 'Upload failed';
};

/**
 * Validates a list of files against the provided constraints.
 *
 * @param {Object} params - The parameters for file validation.
 * @param {FileList} params.files - The list of files to validate.
 * @param {number} [params.maxAllowedFiles] - The maximum number of files allowed.
 * @param {number} [params.maxTotalSize] - The maximum total size of all files in bytes.
 * @returns {string | null} - A validation error message if validation fails, or `null` if validation passes.
 */
export const validateFiles = ({
  files,
  acceptedFileTypes,
  maxAllowedFiles,
  maxTotalSize,
}: {
  files: FileList;
  acceptedFileTypes?: string;
  maxAllowedFiles?: number;
  maxTotalSize?: number;
}): string | null => {

  // Check file types
  if (acceptedFileTypes) {
    const allowedTypes = acceptedFileTypes.split(',').map((type) => type.trim());
    for (const file of Array.from(files)) {
      if (!validateFileType(file, allowedTypes)) {
        return `File type "${file.type}" is not allowed.`;
      }
    }
  }

  if (maxAllowedFiles && files.length > maxAllowedFiles) {
    return `You can only upload up to ${maxAllowedFiles} files at a time.`;
  }

  if (maxTotalSize) {
    const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);
    if (totalSize > maxTotalSize) {
      return `Total file size exceeds the limit of ${(maxTotalSize / (1024 * 1024)).toFixed(2)} MB`;
    }
  }

  return null;
};