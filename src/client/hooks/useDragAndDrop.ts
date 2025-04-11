import { useState, useCallback } from 'react';

/**
 * useDragAndDrop
 *
 * A custom hook to manage drag-and-drop interactions, including tracking
 * whether an element is being dragged over and handling drag events.
 *
 * @returns {Object} - The hook's return values.
 * @returns {boolean} isDragging - Indicates whether a drag operation is currently active.
 * @returns {function} handleDragOver - Callback to handle the `dragover` event.
 * @returns {function} handleDragLeave - Callback to handle the `dragleave` event.
 *
 * @example
 * const { isDragging, handleDragOver, handleDragLeave } = useDragAndDrop();
 *
 * return (
 *   <div
 *     onDragOver={handleDragOver}
 *     onDragLeave={handleDragLeave}
 *     className={isDragging ? 'dragging' : ''}
 *   >
 *     Drag files here
 *   </div>
 * );
 */
export const useDragAndDrop = () => {
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Handles the `dragover` event.
   * Prevents the default browser behavior and sets the `isDragging` state to `true`.
   *
   * @param {React.DragEvent<HTMLDivElement>} e - The drag event.
   */
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  /**
   * Handles the `dragleave` event.
   * Prevents the default browser behavior and sets the `isDragging` state to `false`.
   *
   * @param {React.DragEvent<HTMLDivElement>} e - The drag event.
   */
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return { isDragging, handleDragOver, handleDragLeave };
};