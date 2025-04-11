/**
 * Formats the file size into a human-readable string.
 *
 * @param size - The size of the file in bytes.
 * @returns A formatted string representing the file size (e.g., "1.5 KB", "2 MB").
 */
export const formatFileSize = (size: number | undefined): string => {
  if (!size) return '-';

  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;

  let formattedSize = size;
  while (formattedSize >= 1024 && unitIndex < units.length - 1) {
    formattedSize /= 1024;
    unitIndex++;
  }

  return `${formattedSize.toFixed(1)} ${units[unitIndex]}`;
};