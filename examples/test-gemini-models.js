import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test script to find the correct Gemini model name
 */
async function testGeminiModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.error('GOOGLE_API_KEY is not set');
    return;
  }

  console.log('Testing different Gemini model names...\n');

  const modelNames = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-1.0-pro-latest',
    'gemini-1.0-pro',
    'gemini-pro',
  ];

  for (const modelName of modelNames) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = new ChatGoogleGenerativeAI({
        apiKey: apiKey,
        model: modelName,
        temperature: 0.7,
      });

      const response = await model.invoke('Say "Hello" in one word.');
      console.log(`  ✅ SUCCESS! Model "${modelName}" works`);
      console.log(`  Response: ${response.content}\n`);
      break; // Stop at first successful model
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`  ❌ 404 - Model not found\n`);
      } else {
        console.log(`  ❌ Error: ${error.message.substring(0, 100)}\n`);
      }
    }
  }
}

testGeminiModels();

