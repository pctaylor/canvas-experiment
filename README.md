# Canvas Experiment

A fun and interactive web application that lets you create and modify shapes using plain English commands. Think of it as a drawing board where you can create rectangles and then tell it what to do with them, like "make this box red" or "create a blue pulsing rectangle."

![Canvas Experiment Demo](docs/demo.gif)

## What Can It Do?

- **Draw Shapes**: Click and drag anywhere to create a rectangle
- **Natural Language Control**: Type commands in plain English to modify shapes
  - "make this box red"
  - "create a blue pulsing rectangle"
  - "add a gradient from red to blue"
  - "make this semi-transparent"
- **Easy Manipulation**: 
  - Move shapes by dragging them
  - Resize shapes from any corner
  - Edit or delete shapes with simple buttons
- **Smart AI Integration**: Uses OpenAI's GPT-4 to understand your commands and create visual effects

## Quick Start

1. **Get the Code**
   ```bash
   git clone https://github.com/pctaylor/canvas-experiment.git
   cd canvas-experiment
   ```

2. **Set Up Your Environment**
   ```bash
   # Install dependencies
   npm install

   # Create your environment file
   cp .env.example .env
   ```

3. **Add Your OpenAI API Key**
   - Get an API key from [OpenAI's platform](https://platform.openai.com/api-keys)
   - Open the `.env` file and add your key:
     ```
     VITE_OPENAI_API_KEY=your_api_key_here
     ```

4. **Start the App**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser

## How to Use

### Creating Shapes
1. Click anywhere on the canvas
2. Hold and drag to set the size
3. Release to create the shape

### Modifying Shapes
1. Click on any shape to select it
2. Type your command in the text box (e.g., "make this red")
3. Press Enter to apply the change

### Available Controls
- **Drag Handle** (top bar): Move the shape around
- **Resize Handle** (bottom-right corner): Change shape size
- **Edit Button** (✎): Modify the shape with a new command
- **Delete Button** (×): Remove the shape

### Example Commands
- "make this box red"
- "add a blue border"
- "make it semi-transparent"
- "add a shadow"
- "make it pulse slowly"
- "create a gradient from red to blue"
- "rotate it 45 degrees"

## Troubleshooting

### Common Issues

1. **"Content ref not available" Error**
   - This usually means the shape hasn't fully loaded
   - Try refreshing the page
   - Make sure you're using a modern browser

2. **Shape Not Appearing**
   - Check the browser console for errors
   - Make sure your command is clear and specific
   - Try simpler commands first (e.g., "make it red")

3. **OpenAI API Issues**
   - Verify your API key is correct in `.env`
   - Check your OpenAI account has available credits
   - Ensure you're connected to the internet

### Still Having Problems?
- Check the [Issues](https://github.com/pctaylor/canvas-experiment/issues) page
- Create a new issue with:
  - What you were trying to do
  - What command you used
  - What happened instead
  - Any error messages you saw

## Technical Details

### Built With
- **React**: Frontend framework
- **TypeScript**: Type-safe JavaScript
- **Fabric.js**: Canvas manipulation
- **OpenAI API**: Natural language processing
- **Vite**: Build tool and development server

### Project Structure
```
canvas-experiment/
├── src/
│   ├── components/     # React components
│   │   └── PromptRectangle.tsx  # Main shape component
│   ├── App.tsx        # Main application
│   └── index.tsx      # Entry point
├── public/            # Static assets
└── docs/             # Documentation
```

### Key Features Explained

#### Natural Language Processing
- Commands are sent to OpenAI's GPT-4
- AI generates Fabric.js code based on your description
- Code is safely executed in a controlled environment

#### Interactive Canvas
- Built on Fabric.js for smooth performance
- Real-time updates and animations
- Responsive to window resizing

#### State Management
- React hooks for local state
- Efficient re-rendering
- Persistent shape properties

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit (`git commit -m 'Add some AmazingFeature'`)
5. Push (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenAI](https://openai.com/) for their amazing API
- [Fabric.js](http://fabricjs.com/) for the powerful canvas library
- All our contributors and users! 