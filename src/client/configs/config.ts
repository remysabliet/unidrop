import { checkEnv, checkOptionalEnv, checkEnvNumber } from "C/utils/env-utils";

/**
 * Interface for environment variables used in the application.
 * These variables are loaded from the environment at build time.
 */
export interface Configs {
  singleFileUploadPath: string;
  chunkFileUploadPath: string;
  fileListPath: string;
  beApiBaseUrl: string;
  chunkSizeBytes?: number;
  acceptedFileTypes?: string;
  maxAllowedFiles?: number;
  parallelChunkCount?: number;
  uploadTotalSize?: number;
}

/**
 * Exported configuration constants.
 * The environment variable names are scoped to the build system (e.g., prefixed with VITE_)
 * and converted to a more friendly camelCase in the application.
 */
export const CONFIGS: Configs = {
  singleFileUploadPath: checkEnv('VITE_FILE_UPLOAD_SINGLE_PATH'),
  chunkFileUploadPath: checkEnv('VITE_FILE_UPLOAD_CHUNK_PATH'),
  fileListPath: checkEnv('VITE_FILE_LIST_PATH'),
  beApiBaseUrl: checkEnv('VITE_BE_API_BASE_URL'),
  chunkSizeBytes: checkEnvNumber('VITE_CHUNK_SIZE_BYTES') || 5 * 1024 * 1024,
  acceptedFileTypes: checkOptionalEnv('VITE_ACCEPTED_FILE_TYPES'),
  maxAllowedFiles: checkEnvNumber('VITE_MAX_ALLOWED_FILES'),
  parallelChunkCount: checkEnvNumber('VITE_PARALLEL_CHUNK_COUNT') || 3,
  uploadTotalSize: checkEnvNumber('VITE_UPLOAD_TOTAL_SIZE'),
} as const;
