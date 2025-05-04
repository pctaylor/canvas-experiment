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
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const [originalPrompt, setOriginalPrompt] = useState(rectangle.prompt);

  // Initialize canvas
  const setupCanvas = () => {
    if (!contentRef.current) return null;
    
    // Clean up existing canvas
    if (canvasRef.current) {
      canvasRef.current.dispose();
      canvasRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    contentRef.current.innerHTML = '';

    // Create new canvas
    const canvasElement = document.createElement('canvas');
    contentRef.current.appendChild(canvasElement);
    
    const canvas = new fabric.Canvas(canvasElement, {
      width: rectangle.width,
      height: rectangle.height,
      backgroundColor: 'transparent',
    });
    canvasRef.current = canvas;
    return canvas;
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Execute visualization
  useEffect(() => {
    if (!isEditing && !isLoading && rectangle.content && contentRef.current) {
      setError(null);
      const canvas = setupCanvas();
      if (!canvas) return;

      try {
        // Create execution context with only essential utilities
        const context = {
          canvas,
          width: canvas.width!,
          height: canvas.height!,
          fabric,
          requestAnimationFrame: (fn: FrameRequestCallback) => {
            animationRef.current = window.requestAnimationFrame(fn);
            return animationRef.current;
          },
          cancelAnimationFrame: (id: number) => {
            window.cancelAnimationFrame(id);
            if (animationRef.current === id) {
              animationRef.current = null;
            }
          }
        };

        const executeCode = new Function(
          'canvas', 'width', 'height', 'fabric',
          'requestAnimationFrame', 'cancelAnimationFrame',
          `
          try {
            ${rectangle.content}
          } catch (error) {
            console.error('Visualization error:', error);
            throw error;
          }
        `);
        
        executeCode(
          context.canvas,
          context.width,
          context.height,
          context.fabric,
          context.requestAnimationFrame,
          context.cancelAnimationFrame
        );
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setError('Failed to execute visualization: ' + errorMsg);
      }
    }

    return () => {
      if (canvasRef.current) {
        canvasRef.current.dispose();
        canvasRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isEditing, isLoading, rectangle.content, rectangle.width, rectangle.height]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onUpdate({ ...rectangle, prompt: originalPrompt });
      setIsEditing(false);
      return;
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setError(null);
      setIsLoading(true);
      
      try {
        setOriginalPrompt(rectangle.prompt);
        const content = await generateVisualization(rectangle.prompt);
        onUpdate({ ...rectangle, content });
        setIsEditing(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to generate visualization');
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
      const newWidth = Math.max(200, startWidth + dx);
      const newHeight = Math.max(200, startHeight + dy);
      onResize(rectangle.id, newWidth, newHeight);
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
    setError(null);
    setupCanvas();
  };

  const handleCancel = () => {
    onUpdate({ ...rectangle, prompt: originalPrompt });
    setIsEditing(false);
    setError(null);
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
        border: '2px solid #000',
        backgroundColor: '#fff',
        zIndex,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
          <button
            onClick={handleCancel}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              padding: '4px',
              background: '#fff',
              border: '1px solid #000',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      ) : (
        <>
          <div
            ref={contentRef}
            style={{
              width: '100%',
              height: '100%',
              padding: '16px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          />
          {!isLoading && (
            <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: '4px' }}>
              <button
                onClick={handleEditClick}
                style={{
                  padding: '4px 8px',
                  background: '#fff',
                  border: '1px solid #000',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(rectangle.id)}
                style={{
                  padding: '4px',
                  background: '#fff',
                  border: '1px solid #000',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
          )}
        </>
      )}
      
      {(isLoading || error) && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '10px 20px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 1000,
          color: error ? '#dc3545' : '#000',
        }}>
          {error || 'Generating visualization...'}
        </div>
      )}
      
      {isHovered && !isEditing && !isLoading && (
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
        </>
      )}
    </div>
  );
}; 