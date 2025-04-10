import * as React from "react";
import { cn } from "C/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "default" | "sm" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variantStyles = {
  primary: "bg-purple-600 text-white hover:bg-purple-500 focus-visible:ring-purple-500",
  secondary: "bg-purple-100 text-purple-800 hover:bg-purple-200 focus-visible:ring-purple-300",
};

const sizeStyles = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 px-3 py-1.5 text-sm",
  lg: "h-12 px-6 py-3 text-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      icon,
      iconPosition = "left",
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        ref={ref}
        disabled={loading || props.disabled} // Disable button if loading
        {...props}
      >
        {loading && <span className="loader mr-2" />} {/* Loader for loading state */}
        {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";