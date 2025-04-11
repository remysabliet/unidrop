import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using `clsx` and merges Tailwind CSS classes using `tailwind-merge`.
 *
 * @param {...ClassValue[]} inputs - A list of class values that can include strings, arrays, or conditional objects.
 * @returns {string} - A single string of merged and deduplicated class names.
 *
 * @example
 * // Basic usage
 * cn('bg-red-500', 'text-white', 'p-4');
 * // Returns: 'bg-red-500 text-white p-4'
 *
 * @example
 * // Conditional classes
 * cn('bg-red-500', { 'text-white': true, 'text-black': false });
 * // Returns: 'bg-red-500 text-white'
 *
 * @example
 * // Tailwind class merging
 * cn('p-4', 'p-2');
 * // Returns: 'p-2' (last class takes precedence)
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};