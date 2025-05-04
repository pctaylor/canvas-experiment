// Add type declarations for Vite env
declare global {
  interface ImportMetaEnv {
    VITE_OPENAI_API_KEY: string
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

console.log('DEBUG: openai.ts loaded');

import OpenAI from 'openai';
import { Rectangle } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `You are a code generator for Fabric.js canvas visualizations. Generate executable JavaScript code based on natural language prompts.

RESPONSE FORMAT:
---CODE---
(function(canvas, width, height) {
  // Your code here - NO EMPTY FUNCTIONS OR EMPTY STRINGS AS FUNCTIONS
  canvas.renderAll();
})(canvas, width, height);
---EXPLANATION---
Brief explanation of what the code does

IMPORTANT RULES:
1. NEVER return empty functions or try to call empty strings as functions
2. ALWAYS wrap code in an IIFE (as shown in format above)
3. ALWAYS use proper function declarations or arrow functions
4. NEVER leave any undefined variables
5. ALWAYS initialize variables before use
6. NEVER use canvas methods directly - only Fabric.js objects
7. ALWAYS use canvas.add() for new objects
8. ALWAYS call canvas.renderAll() after adding or modifying objects

AVAILABLE CONTEXT:
- canvas: Fabric.js Canvas instance (NOT a regular canvas context - always use fabric.* objects)
- width/height: Canvas dimensions (IMPORTANT: Always use these for proper scaling)
- fabric: Fabric.js library
- requestAnimationFrame/cancelAnimationFrame: For animations

CORE PRINCIPLES:
1. ALWAYS use Fabric.js objects (fabric.Text, fabric.Rect, etc.) instead of canvas methods
2. NEVER use canvas.fillRect, canvas.fillText, etc. - these don't exist in Fabric.js
3. Use canvas dimensions properly - ALWAYS use the provided width/height parameters
4. Clean up resources
5. Handle errors gracefully
6. Keep code simple and focused

GUIDELINES:
- For text: use new fabric.Text("text", { left: x, top: y })
- For rectangles: use new fabric.Rect({ left: x, top: y, width: w, height: h })
- For lines: use new fabric.Line([x1,y1,x2,y2], { stroke: color })
- For shapes that should fill canvas: use new fabric.Rect({ left: 0, top: 0, width: width, height: height })

FILLING THE CANVAS:
When asked to fill the canvas or make a shape fill the space:
const rect = new fabric.Rect({
  left: 0,
  top: 0,
  width: width,
  height: height,
  fill: 'color'
});
canvas.add(rect);

CREATING CHARTS:
For line charts or financial data:
1. Setup chart area:
   const padding = 50;
   const chartWidth = width - 2 * padding;
   const chartHeight = height - 2 * padding;

2. Create axes:
   const xAxis = new fabric.Line([padding, height - padding, width - padding, height - padding], {
     stroke: 'black',
     strokeWidth: 1
   });
   const yAxis = new fabric.Line([padding, padding, padding, height - padding], {
     stroke: 'black',
     strokeWidth: 1
   });
   canvas.add(xAxis, yAxis);

3. Plot data:
   // Generate points array from data
   const points = data.map((value, i) => ({
     x: padding + (i / (data.length - 1)) * chartWidth,
     y: height - padding - ((value - minValue) / (maxValue - minValue)) * chartHeight
   }));

   // Create line
   const line = new fabric.Polyline(points, {
     stroke: color,
     strokeWidth: 2,
     fill: ''
   });
   canvas.add(line);

4. Add labels and legend as needed:
   const label = new fabric.Text(text, {
     left: x,
     top: y,
     fontSize: 12
   });
   canvas.add(label);

6. ALWAYS call canvas.renderAll() at the end

For Matrix-style effects:
1. Create text using fabric.Text objects:
   const text = new fabric.Text("A", {
     left: x,
     top: y,
     fill: "#0F0",
     fontSize: 16
   });
   canvas.add(text);

2. Animate using requestAnimationFrame:
   const animate = () => {
     text.set('top', text.top + speed);
     canvas.renderAll();
     requestAnimationFrame(animate);
   };
   animate();

3. Clean up:
   canvas.remove(oldObjects);
   canvas.renderAll();`;

export const generateVisualization = async (prompt: string): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 1500,
    });

    let response = completion.choices[0]?.message?.content || '';
    
    // Extract code from between the markers
    const codeMatch = response.match(/---CODE---([\s\S]*?)---EXPLANATION---/);
    if (!codeMatch) {
      console.error('Error: AI response missing code section');
      throw new Error('Invalid response format from AI');
    }
    
    let code = codeMatch[1].trim();
    
    // Validate code has no empty function calls
    if (code.includes('""()') || code.includes("''()") || /\(\s*\"\"\s*\)/.test(code)) {
      throw new Error('Invalid code: contains empty function calls');
    }
    
    // Ensure code is properly wrapped in IIFE
    if (!code.startsWith('(function(canvas, width, height)')) {
      code = `(function(canvas, width, height) {
        ${code}
      })(canvas, width, height);`;
    }
    
    // Ensure renderAll is called at the end of the function
    if (!code.includes('canvas.renderAll();')) {
      code = code.replace(/}\)\(canvas,\s*width,\s*height\);$/, 
        'canvas.renderAll();\n})(canvas, width, height);');
    }

    // Log the final code for debugging
    console.log('Executing visualization code:', code);
    
    return code;
  } catch (error) {
    console.error('Visualization generation failed:', error);
    throw error;
  }
}; 