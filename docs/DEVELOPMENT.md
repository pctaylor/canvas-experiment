# Development Guide

This guide explains the technical aspects of the Canvas Experiment project and how to work with its codebase.

## Project Overview

The Canvas Experiment is built using React and TypeScript, with Fabric.js for canvas manipulation and OpenAI's GPT-4 for natural language processing. The application allows users to create and manipulate shapes on a canvas using natural language commands.

## Key Components

### PromptRectangle Component

The main component that handles:
- Shape creation and manipulation
- Natural language processing
- Canvas rendering
- State management
- User interactions

Key features:
```typescript
interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prompt: string;
  content: string;
}
```

### Natural Language Processing

Commands are processed in this flow:
1. User enters a command
2. Command is sent to OpenAI's API
3. API returns Fabric.js code
4. Code is executed in a controlled environment
5. Canvas is updated with the result

## State Management

The application uses React's built-in state management with hooks:
- `useState` for component-level state
- `useRef` for canvas and DOM references
- `useEffect` for side effects and cleanup

Example state structure:
```typescript
const [isEditing, setIsEditing] = useState(true);
const [isLoading, setIsLoading] = useState(false);
const [isHovered, setIsHovered] = useState(false);
```

## Canvas Manipulation

Fabric.js is used for all canvas operations:
- Shape creation
- Positioning
- Resizing
- Animation
- Event handling

Example canvas initialization:
```typescript
const fabricCanvas = new fabric.Canvas(canvasElement, {
  width: rect.width,
  height: rect.height,
  backgroundColor: 'transparent',
});
```

## Development Workflow

1. **Setup**
   ```bash
   npm install
   cp .env.example .env
   # Add your OpenAI API key to .env
   ```

2. **Development Server**
   ```bash
   npm run dev
   ```

3. **Building**
   ```bash
   npm run build
   ```

4. **Testing Changes**
   - Make changes in a feature branch
   - Test thoroughly with different commands
   - Check console for errors
   - Verify state management
   - Test edge cases

## Common Development Tasks

### Adding New Features

1. **New Shape Types**
   - Add shape interface
   - Create shape component
   - Add to shape factory
   - Update OpenAI prompt

2. **New Commands**
   - Update system prompt
   - Add command handling
   - Test with various inputs

3. **UI Improvements**
   - Update component styles
   - Add new controls
   - Enhance user feedback

### Debugging Tips

1. **Console Logging**
   ```typescript
   console.log('State changed:', {
     isEditing,
     isLoading,
     rectangle
   });
   ```

2. **React DevTools**
   - Monitor component state
   - Track re-renders
   - Debug performance

3. **Canvas Debugging**
   ```typescript
   fabricCanvas.on('object:modified', (e) => {
     console.log('Canvas object modified:', e);
   });
   ```

## Best Practices

1. **State Management**
   - Keep state minimal
   - Use appropriate state level
   - Clean up side effects

2. **Error Handling**
   ```typescript
   try {
     // Risky operation
   } catch (error) {
     console.error('Operation failed:', error);
     // Provide user feedback
   }
   ```

3. **Performance**
   - Debounce user input
   - Optimize canvas operations
   - Lazy load components

4. **Security**
   - Sanitize user input
   - Validate API responses
   - Safe code execution

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## Resources

- [React Documentation](https://reactjs.org/docs)
- [Fabric.js Docs](http://fabricjs.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [TypeScript Handbook](https://www.typescriptlang.org/docs) 