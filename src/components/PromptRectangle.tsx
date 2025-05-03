import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import { PromptRectangleProps } from '../types';
import { generateVisualization } from '../utils/openai';

export const PromptRectangle: React.FC<PromptRectangleProps> = ({
  rectangle,
  onUpdate,
  onDelete,
  onResize,
  onMove,
  zIndex,
}) => {
  const [isEditing, setIsEditing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const [originalPrompt, setOriginalPrompt] = useState(rectangle.prompt);

  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        canvasRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onUpdate({ ...rectangle, prompt: originalPrompt });
      setIsEditing(false);
      return;
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsLoading(true);
      
      try {
        setOriginalPrompt(rectangle.prompt);
        const content = await generateVisualization(rectangle.prompt);
        onUpdate({ ...rectangle, content });
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to generate visualization:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = rectangle.x;
    const startTop = rectangle.y;

    const handleDrag = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      onMove(rectangle.id, startLeft + dx, startTop + dy);
    };

    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = rectangle.width;
    const startHeight = rectangle.height;

    const handleResize = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      onResize(rectangle.id, startWidth + dx, startHeight + dy);
    };

    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeEnd);
    };

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    onUpdate({ ...rectangle, prompt: originalPrompt });
    setIsEditing(false);
  };

  return (
    <div
      ref={containerRef}
      className="prompt-rectangle"
      style={{
        position: 'absolute',
        left: rectangle.x,
        top: rectangle.y,
        width: rectangle.width,
        height: rectangle.height,
        zIndex,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <textarea
          ref={inputRef}
          value={rectangle.prompt}
          onChange={(e) => onUpdate({ ...rectangle, prompt: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="Enter your prompt here..."
          style={{
            width: '100%',
            height: '100%',
            padding: '8px',
            border: 'none',
            resize: 'none',
            outline: 'none',
            background: 'transparent',
          }}
        />
      ) : (
        <div
          ref={contentRef}
          style={{
            width: '100%',
            height: '100%',
            padding: '8px',
            overflow: 'auto',
          }}
        >
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: rectangle.content }} />
          )}
        </div>
      )}
      
      {isHovered && !isEditing && (
        <>
          <div
            ref={dragHandleRef}
            className="drag-handle"
            onMouseDown={handleDragStart}
            style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              width: '8px',
              height: '8px',
              background: '#000',
              cursor: 'move',
            }}
          />
          <div
            ref={resizeHandleRef}
            className="resize-handle"
            onMouseDown={handleResizeStart}
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              background: '#000',
              cursor: 'se-resize',
            }}
          />
          <button
            onClick={handleEditClick}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              padding: '4px 8px',
              background: '#fff',
              border: '1px solid #000',
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
}; 