import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import OpenAI from 'openai';

interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prompt: string;
  content: string;
}

interface PromptRectangleProps {
  rectangle: Rectangle;
  onUpdate: (rectangle: Rectangle) => void;
  onDelete: (id: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onMove: (id: string, x: number, y: number) => void;
  zIndex: number;
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

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

  // Cleanup canvas on unmount
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

  // Debug state changes
  useEffect(() => {
    console.log('State changed - isEditing:', isEditing);
  }, [isEditing]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('Enter pressed - current isEditing:', isEditing);
      setIsLoading(true);
      
      try {
        console.log('Sending prompt to OpenAI:', rectangle.prompt);
        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are a code generator for Fabric.js canvas animations. Return ONLY JavaScript code that follows these rules:
1. Code must work with a Fabric.js canvas passed as 'canvas' parameter
2. No HTML, no markdown, no explanations
3. Use Fabric.js objects (fabric.Text, fabric.Rect, etc.) for all drawing
4. If you need animation, include a function called 'animate' that uses requestAnimationFrame
5. If you create classes/objects, they must be instantiated
6. All code must be inside a single self-executing function
Example template:
(function(canvas) {
  // Your code here
  // If animation is needed:
  function animate() {
    // Animation code
    canvas.renderAll();
    requestAnimationFrame(animate);
  }
  animate(); // Start animation if needed
})(canvas);`
            },
            {
              role: 'user',
              content: rectangle.prompt
            }
          ],
          model: 'gpt-4',
        });

        console.log('OpenAI response received');
        const code = completion.choices[0].message.content;
        console.log('Code parsed:', code);
        
        if (!code) {
          console.error('No code received from OpenAI');
          return;
        }

        // Update rectangle content first
        const updatedRectangle = { ...rectangle, prompt: '', content: code };
        onUpdate(updatedRectangle);

        // Then update editing state
        setIsEditing(false);
        
        // Wait for state updates to propagate
        await new Promise(resolve => setTimeout(resolve, 100));

        // Setup canvas after state updates
        if (!contentRef.current) {
          console.error('Content ref lost after state update');
          setIsEditing(true); // Revert to editing state if we can't set up canvas
          return;
        }

        console.log('Setting up canvas container');
        // Clear existing content
        contentRef.current.innerHTML = '';
        
        // Create and configure canvas element
        const canvasElement = document.createElement('canvas');
        canvasElement.style.width = '100%';
        canvasElement.style.height = '100%';
        contentRef.current.appendChild(canvasElement);

        // Get parent dimensions
        const rect = contentRef.current.getBoundingClientRect();
        
        // Initialize Fabric.js canvas with exact dimensions
        const fabricCanvas = new fabric.Canvas(canvasElement, {
          width: rect.width,
          height: rect.height,
          backgroundColor: 'transparent',
        });
        
        canvasRef.current = fabricCanvas;

        // Execute the code with adjusted dimensions
        try {
          console.log('Executing code on canvas');
          const modifiedCode = code
            .replace(/left:\s*\d+/g, 'left: 0')
            .replace(/top:\s*\d+/g, 'top: 0')
            .replace(/width:\s*\d+/g, `width: ${rect.width}`)
            .replace(/height:\s*\d+/g, `height: ${rect.height}`);
          console.log('Modified code:', modifiedCode);
          const executeCode = new Function('canvas', modifiedCode);
          executeCode(fabricCanvas);
          console.log('Code executed successfully');
          fabricCanvas.renderAll();
        } catch (error) {
          console.error('Error executing code:', error);
          if (contentRef.current) {
            contentRef.current.innerHTML = '<div style="color: red; padding: 10px;">Error executing code: ' + error + '</div>';
          }
          setIsEditing(true); // Revert to editing state on error
        }
      } catch (error) {
        console.error('Error:', error);
        if (contentRef.current) {
          contentRef.current.innerHTML = '<div style="color: red; padding: 10px;">Error: ' + error + '</div>';
        }
        setIsEditing(true); // Revert to editing state on error
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDragStart = (e: React.MouseEvent) => {
    if (e.target !== dragHandleRef.current) return;
    
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
    if (e.target !== resizeHandleRef.current) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = rectangle.width;
    const startHeight = rectangle.height;

    const handleResize = (e: MouseEvent) => {
      const newWidth = Math.max(100, startWidth + (e.clientX - startX));
      const newHeight = Math.max(100, startHeight + (e.clientY - startY));
      onResize(rectangle.id, newWidth, newHeight);
      
      // Resize the Fabric.js canvas if it exists
      if (canvasRef.current && contentRef.current) {
        canvasRef.current.setDimensions({
          width: contentRef.current.clientWidth,
          height: contentRef.current.clientHeight,
        });
      }
    };

    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeEnd);
    };

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: rectangle.x,
        top: rectangle.y,
        width: rectangle.width,
        height: rectangle.height,
        border: '2px solid #000',
        padding: '10px',
        backgroundColor: '#fff',
        zIndex,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={dragHandleRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '20px',
          backgroundColor: '#f0f0f0',
          cursor: 'grab',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
        onMouseDown={handleDragStart}
      />
      <div
        style={{
          marginTop: '20px',
          height: 'calc(100% - 20px)',
          position: 'relative',
        }}
      >
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={rectangle.prompt}
            onChange={(e) => onUpdate({ ...rectangle, prompt: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Type your prompt and press Enter..."
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              padding: '5px',
              resize: 'none',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflow: 'auto',
            }}
          />
        ) : (
          <div
            ref={contentRef}
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
          />
        )}
      </div>
      <div
        ref={resizeHandleRef}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '20px',
          height: '20px',
          backgroundColor: '#fff',
          border: '1px solid #000',
          cursor: 'se-resize',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
        onMouseDown={handleResizeStart}
      />
      {isHovered && (
        <>
          <button
            onClick={() => onDelete(rectangle.id)}
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              background: '#fff',
              border: '1px solid #000',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              transition: 'opacity 0.2s',
            }}
          >
            ×
          </button>
          {!isEditing && (
            <button
              onClick={() => {
                if (canvasRef.current) {
                  canvasRef.current.dispose();
                }
                setIsEditing(true);
              }}
              style={{
                position: 'absolute',
                top: '5px',
                right: '30px',
                background: '#fff',
                border: '1px solid #000',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                transition: 'opacity 0.2s',
                fontSize: '12px',
              }}
            >
              ✎
            </button>
          )}
        </>
      )}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
}; 