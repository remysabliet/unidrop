import React from "react";
import { cn } from "C/utils";

export interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className={cn("mt-2 flex items-center gap-3 text-sm text-red-600")}>
      <span className="flex-1">
        An error occurred: <strong>{message}</strong>
      </span>
    </div>
  );
};
