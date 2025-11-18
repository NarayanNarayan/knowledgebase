import dotenv from 'dotenv';

dotenv.config();

/**
 * List available Gemini models using direct API call
 */
async function listGeminiModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.error('GOOGLE_API_KEY is not set');
    return;
  }

  console.log('Fetching available Gemini models from API...\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      return;
    }

    const data = await response.json();
    
    console.log('Available models that support generateContent:\n');
    
    if (data.models && Array.isArray(data.models)) {
      const generateContentModels = data.models
        .filter(model => 
          model.supportedGenerationMethods && 
          model.supportedGenerationMethods.includes('generateContent')
        )
        .map(model => ({
          name: model.name,
          displayName: model.displayName,
          description: model.description,
        }));

      generateContentModels.forEach(model => {
        console.log(`✅ ${model.name}`);
        console.log(`   Display: ${model.displayName}`);
        if (model.description) {
          console.log(`   ${model.description.substring(0, 80)}...`);
        }
        console.log('');
      });

      if (generateContentModels.length > 0) {
        console.log('\nRecommended model name to use:', generateContentModels[0].name);
      }
    } else {
      console.log('No models found or unexpected response format');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error fetching models:', error.message);
  }
}

listGeminiModels();

