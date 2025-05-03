export interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prompt: string;
  content: string;
}

export interface PromptRectangleProps {
  rectangle: Rectangle;
  onUpdate: (rectangle: Rectangle) => void;
  onDelete: (id: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onMove: (id: string, x: number, y: number) => void;
  zIndex: number;
} 