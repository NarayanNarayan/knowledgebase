import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const model = new ChatGoogleGenerativeAI({
    apiKey: "AIzaSyAgGjCGnHTX7KD_qTDW9UopbYAM12YcMzc",
    model: 'gemini-pro',
    temperature: 0.7,
});