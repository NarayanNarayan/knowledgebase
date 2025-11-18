import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test if LangChain handles models/ prefix automatically
 */
async function testModelName() {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.error('GOOGLE_API_KEY is not set');
    return;
  }

  console.log('Testing model name formats...\n');

  // Test 1: With models/ prefix
  try {
    console.log('Test 1: With "models/" prefix (models/gemini-2.5-flash)...');
    const model1 = new ChatGoogleGenerativeAI({
      apiKey: apiKey,
      model: 'models/gemini-2.5-flash',
      temperature: 0.7,
    });
    const response1 = await model1.invoke('Say "Hello"');
    console.log('  ✅ SUCCESS!');
    console.log(`  Response: ${response1.content}\n`);
    console.log('✅ Use format: models/gemini-2.5-flash\n');
    return;
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message.substring(0, 100)}\n`);
  }

  // Test 2: Without models/ prefix
  try {
    console.log('Test 2: Without "models/" prefix (gemini-2.5-flash)...');
    const model2 = new ChatGoogleGenerativeAI({
      apiKey: apiKey,
      model: 'gemini-2.5-flash',
      temperature: 0.7,
    });
    const response2 = await model2.invoke('Say "Hello"');
    console.log('  ✅ SUCCESS!');
    console.log(`  Response: ${response2.content}\n`);
    console.log('✅ Use format: gemini-2.5-flash (LangChain adds models/ automatically)\n');
    return;
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message.substring(0, 100)}\n`);
  }
}

testModelName();

