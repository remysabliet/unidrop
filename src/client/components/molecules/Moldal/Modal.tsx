// src/components/molecules/Modal.tsx
import React, { ReactNode } from 'react';
import { cn } from 'C/utils'; // Utility for combining Tailwind CSS class names

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={cn("fixed inset-0 flex items-center justify-center z-50")}>
      <div
        className={cn("absolute inset-0 bg-black opacity-50")}
        onClick={onClose}
        aria-hidden="true"
        data-testid="modal-backdrop"
      />
      <div
        className={cn(
          "relative bg-white rounded-lg shadow-xl p-8",
          "max-w-xl w-full"
        )}
      >
        <button
          onClick={onClose}
          className={cn(
            "absolute top-3 right-3 flex items-center justify-center",
            "w-8 h-8 rounded-full bg-white border border-gray-300",
            "hover:bg-gray-100 transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          )}
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {children}
      </div>
    </div>
  );
};
