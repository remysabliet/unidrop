import { readdirSync, existsSync } from 'fs';

/**
 * Returns the list of previously uploaded chunk indexes not merged yet for a given fileId (filename).
 */
export const getUploadedChunkIndexes = (chunkDir: string, fileId: string): number[] => {
  if (!existsSync(chunkDir)) {
    return [];
  }

  return readdirSync(chunkDir)
    .filter(file => file.startsWith(`${fileId}.part_`))
    .map(file => {
      const match = file.match(/\.part_(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n): n is number => typeof n === 'number');
}