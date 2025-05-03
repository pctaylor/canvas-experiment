# Canvas Experiment

An interactive canvas-based application that allows users to create and manipulate rectangles through natural language prompts. Built with React, Fabric.js, and OpenAI.

## Features

- Create rectangles by drawing on the canvas
- Edit rectangles through natural language prompts using OpenAI
- Interactive drag and resize functionality
- Real-time canvas manipulation
- Smooth state transitions and animations

## Tech Stack

- React
- TypeScript
- Fabric.js
- OpenAI API
- Vite

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Click and drag on the canvas to create a new rectangle
2. Enter a natural language prompt to modify the rectangle (e.g., "make this box red")
3. Use the drag handle to move rectangles
4. Use the resize handle to adjust rectangle dimensions
5. Hover over rectangles to see available controls
6. Click the edit button (✎) to modify existing prompts
7. Click the delete button (×) to remove rectangles

## License

MIT 