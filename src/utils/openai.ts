import OpenAI from 'openai';
import { Rectangle } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `You are a code generator for Fabric.js canvas animations and visualizations. You have extensive knowledge about various topics including financial markets, statistics, and data trends. When creating data visualizations, you MUST include:

1. Axes:
   - X and Y axes lines with proper scales
   - Tick marks at regular intervals
   - Scale labels at tick marks
   - Axis titles that describe the data

2. Chart Elements:
   - Title describing the visualization
   - Legend if multiple data series
   - Grid lines (optional but recommended)
   - Data source or time period if relevant

3. Data Representation:
   - Clear visual distinction between different data series
   - Appropriate scaling and normalization
   - Smooth line connections between data points

For ALL responses, follow these rules:
1. Code must work with a Fabric.js canvas passed as 'canvas' parameter
2. No HTML, no markdown, no explanations
3. Use Fabric.js objects (fabric.Text, fabric.Line, fabric.Path, etc.) for all drawing
4. If you need animation, include a function called 'animate' that uses requestAnimationFrame
5. If you create classes/objects, they must be instantiated
6. All code must be inside a single self-executing function`;

export const generateVisualization = async (prompt: string): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'gpt-4',
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating visualization:', error);
    throw error;
  }
}; 