import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FileUpload } from './FileUpload'; // Adjust the import path as needed

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock the FileIcon (SVG) so tests don't depend on the actual asset.
vi.mock('assets/fileUpload.svg?react', () => ({
  default: () => <svg data-testid="mock-svg" />,
}));

// Mock the fileService module to avoid real network requests.
// The simulated response is an object with fileName and a message.
vi.mock('C/services/fileUpload', () => {
  return {
    fileService: {
      uploadFile: vi.fn().mockImplementation(
        (file: File, onProgress?: (prog: number) => void) => {
          if (onProgress) onProgress(100);
          return Promise.resolve({ message: 'Simulated upload success', fileName: file.name });
        }
      ),
    },
  };
});

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Creates a FileList-like object from an array of Files.
 * This helper copies essential properties so that the object mimics a native FileList.
 */
function createFileList(files: File[]): FileList {
  const fileList: Partial<FileList> = {
    length: files.length,
    item: (index: number) => files[index] || null,
    [Symbol.iterator]: files[Symbol.iterator].bind(files),
  };
  files.forEach((file, index) => {
    fileList[index] = file;
  });
  return fileList as FileList;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('FileUpload Component', () => {
  // Mocks for the callbacks
  const mockOnUploadComplete = vi.fn();
  const mockRenderErrorMessage = vi.fn((message) => <div>{message}</div>);

  const defaultProps = {
    acceptedFileTypes: 'image/jpeg,image/png',
    maxAllowedFiles: 3,
    maxTotalSize: 5 * 1024 * 1024, // 5 MB
    onUploadComplete: mockOnUploadComplete,
    renderErrorMessage: mockRenderErrorMessage,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Successful Uploads
  // -------------------------------------------------------------------------
  describe('Successful Uploads', () => {
    it('should allow a single valid file to be uploaded', async () => {
      render(<FileUpload {...defaultProps} />);
      const input = screen.getByTestId('file-input');

      const validFile = new File(['content'], 'file.jpg', { type: 'image/jpeg' });
      const fileList = createFileList([validFile]);

      fireEvent.change(input, { target: { files: fileList } });

      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith([
          { fileName: 'file.jpg', message: 'Simulated upload success' },
        ]);
      });
    });

    it('should allow multiple valid files if within the limit', async () => {
      render(<FileUpload {...defaultProps} />);
      const input = screen.getByTestId('file-input');

      const file1 = new File(['hello'], 'file1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['world'], 'file2.png', { type: 'image/png' });
      const fileList = createFileList([file1, file2]);

      fireEvent.change(input, { target: { files: fileList } });

      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith([
          { fileName: 'file1.jpg', message: 'Simulated upload success' },
          { fileName: 'file2.png', message: 'Simulated upload success' },
        ]);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Error Handling
  // -------------------------------------------------------------------------
  describe('Error Handling', () => {
    it('should display an error if the file type is not allowed', async () => {
      render(<FileUpload {...defaultProps} />);
      const input = screen.getByTestId('file-input');

      const invalidFile = new File(['content'], 'file.txt', { type: 'text/plain' });
      const fileList = createFileList([invalidFile]);

      fireEvent.change(input, { target: { files: fileList } });

      await waitFor(() => {
        expect(screen.getByText('File type "text/plain" is not allowed.')).toBeInTheDocument();
      });
    });

    it('should display an error if the number of files exceeds the limit', async () => {
      render(<FileUpload {...defaultProps} />);
      const input = screen.getByTestId('file-input');

      const files = [
        new File(['content'], 'file1.jpg', { type: 'image/jpeg' }),
        new File(['content'], 'file2.jpg', { type: 'image/jpeg' }),
        new File(['content'], 'file3.jpg', { type: 'image/jpeg' }),
        new File(['content'], 'file4.jpg', { type: 'image/jpeg' }),
      ];
      const fileList = createFileList(files);

      fireEvent.change(input, { target: { files: fileList } });

      await waitFor(() => {
        expect(screen.getByText('You can only upload up to 3 files at a time.')).toBeInTheDocument();
      });
    });

    it('should display an error if the total file size exceeds the limit', async () => {
      render(<FileUpload {...defaultProps} />);
      const input = screen.getByTestId('file-input');

      // Create a file with 6 MB of content.
      const largeFileContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const largeFile = new File([largeFileContent], 'large.jpg', { type: 'image/jpeg' });
      const fileList = createFileList([largeFile]);

      fireEvent.change(input, { target: { files: fileList } });

      await waitFor(() => {
        expect(
          screen.getByText('Total file size exceeds the limit of 5.00 MB')
        ).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // User Interaction
  // -------------------------------------------------------------------------
  describe('User Interaction', () => {
    it('should render the file input and allow file selection', () => {
      render(<FileUpload {...defaultProps} />);
      const input = screen.getByTestId('file-input');

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'file');
    });

    it('should allow drag-and-drop file uploads', async () => {
      render(<FileUpload {...defaultProps} />);
      const dropzone = screen.getByRole('button', { name: /file upload area/i });

      const validFile = new File(['content'], 'file.jpg', { type: 'image/jpeg' });
      const fileList = createFileList([validFile]);

      // Simulate a drop event using a fake dataTransfer object.
      const fakeDataTransfer = {
        files: fileList,
        types: ['Files'],
        getData: () => '',
      };

      fireEvent.dragOver(dropzone);
      fireEvent.drop(dropzone, { dataTransfer: fakeDataTransfer });

      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith([
          { fileName: 'file.jpg', message: 'Simulated upload success' },
        ]);
      });
    });

    it('should display an error if an invalid file is dropped', async () => {
      render(<FileUpload {...defaultProps} />);
      const dropzone = screen.getByRole('button', { name: /file upload area/i });

      const invalidFile = new File(['content'], 'file.txt', { type: 'text/plain' });
      const fileList = createFileList([invalidFile]);
      const fakeDataTransfer = {
        files: fileList,
        types: ['Files'],
        getData: () => '',
      };

      fireEvent.dragOver(dropzone);
      fireEvent.drop(dropzone, { dataTransfer: fakeDataTransfer });

      await waitFor(() => {
        expect(screen.getByText('File type "text/plain" is not allowed.')).toBeInTheDocument();
      });
    });
  });
});
