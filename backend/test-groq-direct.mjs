import dotenv from 'dotenv';
dotenv.config();
import { generateAIFeedback } from './src/services/ai/gemini.service.js';

async function test() {
  console.log('Testing generateAIFeedback with Groq...');
  const result = await generateAIFeedback({
    topic: 'Modern Web Development Workshop',
    description: 'Hands on React and Node.js session',
    feedbackCount: 3,
    tone: 'Positive',
    length: 'medium',
    language: 'English',
  });

  console.log('Result Mode :', result.mode);
  console.log('Model Used  :', result.model);
  console.log('Duration    :', result.generationDuration, 'ms');
  console.log('Feedback Count:', result.feedback.length);
  console.log('Sample Draft 1:', result.feedback[0]);
}

test().catch(console.error);
