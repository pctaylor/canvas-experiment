import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { PromptRectangle } from './components/PromptRectangle';
import { Rectangle } from './types';

export const App: React.FC = () => {
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const tempRectRef = useRef<fabric.Rect | null>(null);

  useEffect(() => {
    const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvasElement) {
      console.error('Canvas element not found!');
      return;
    }

    const canvas = new fabric.Canvas(canvasElement, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#f0f0f0',
    });
    canvasRef.current = canvas;

    const handleResize = () => {
      canvas.setWidth(window.innerWidth);
      canvas.setHeight(window.innerHeight);
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const point = canvasRef.current.getPointer(e);
    setIsDrawing(true);
    setStartPoint({ x: point.x, y: point.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return;
    
    const point = canvasRef.current.getPointer(e);
    const width = point.x - startPoint.x;
    const height = point.y - startPoint.y;

    if (tempRectRef.current) {
      canvasRef.current.remove(tempRectRef.current);
    }

    const rect = new fabric.Rect({
      left: startPoint.x,
      top: startPoint.y,
      width,
      height,
      fill: 'transparent',
      stroke: '#000',
      strokeWidth: 2,
    });

    tempRectRef.current = rect;
    canvasRef.current.add(rect);
    canvasRef.current.renderAll();
  };

  const handleMouseUp = () => {
    if (!isDrawing || !startPoint || !canvasRef.current) return;
    
    setIsDrawing(false);
    const rect = tempRectRef.current;
    if (rect) {
      const { left, top, width, height } = rect;
      
      const newRect = {
        x: left!,
        y: top!,
        width: width!,
        height: height!,
      };
      
      const hasOverlap = rectangles.some(existingRect => {
        return !(
          newRect.x + newRect.width < existingRect.x ||
          newRect.x > existingRect.x + existingRect.width ||
          newRect.y + newRect.height < existingRect.y ||
          newRect.y > existingRect.y + existingRect.height
        );
      });
      
      if (!hasOverlap) {
        const newRectangle: Rectangle = {
          id: Date.now().toString(),
          x: left!,
          y: top!,
          width: width!,
          height: height!,
          prompt: '',
          content: '',
        };
        setRectangles(prevRectangles => [...prevRectangles, newRectangle]);
      }
      
      canvasRef.current.remove(rect);
      tempRectRef.current = null;
      canvasRef.current.renderAll();
    }
  };

  const handleDeleteRectangle = (id: string) => {
    setRectangles(rectangles.filter(rect => rect.id !== id));
  };

  const handleResizeRectangle = (id: string, width: number, height: number) => {
    setRectangles(rectangles.map(rect => {
      if (rect.id === id) {
        return { ...rect, width, height };
      }
      return rect;
    }));
  };

  const handleMoveRectangle = (id: string, x: number, y: number) => {
    setRectangles(rectangles.map(rect => {
      if (rect.id === id) {
        return { ...rect, x, y };
      }
      return rect;
    }));
  };

  return (
    <div className="app">
      <canvas
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      {rectangles.map((rect, index) => (
        <PromptRectangle
          key={rect.id}
          rectangle={rect}
          onUpdate={(updatedRect) => {
            setRectangles(rectangles.map((r) =>
              r.id === updatedRect.id ? updatedRect : r
            ));
          }}
          onDelete={handleDeleteRectangle}
          onResize={handleResizeRectangle}
          onMove={handleMoveRectangle}
          zIndex={rectangles.length - index}
        />
      ))}
    </div>
  );
}; 