import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE_API_URL = "https://api.langflow.astra.datastax.com";
const LANGFLOW_ID = "396deb1c-aadd-4f18-bd9e-a350c13098df";
const FLOW_ID = "bca2b923-d854-4755-86a8-0b51c350c42b";

// Add timeout utility
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message } = request.body;
    const token = process.env.ASTRA_DB_TOKEN;

    if (!token) {
      return response.status(500).json({ 
        message: 'API token not configured' 
      });
    }

    const api_url = `${BASE_API_URL}/lf/${LANGFLOW_ID}/api/v1/run/${FLOW_ID}`;

    const payload = {
      input_value: message,
      output_type: "chat",
      input_type: "chat",
      tweaks: {
        "ChatInput-607TC": {},
        "ParseData-N1SbE": {},
        "Prompt-UkRo0": {},
        "SplitText-gMLdN": {},
        "ChatOutput-XjUer": {},
        "AstraDB-7D7if": {},
        "AstraDB-CFram": {},
        "File-KaGXk": {},
        "AzureOpenAIEmbeddings-27D3Q": {},
        "AzureOpenAIEmbeddings-aOEe5": {},
        "AzureOpenAIModel-8Uo4q": {}
      }
    };

    const apiResponse = await fetchWithTimeout(
      api_url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      },
      60000 // 60 second timeout
    );

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('API Error:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        body: errorText
      });
      
      return response.status(apiResponse.status).json({
        message: `API Error: ${apiResponse.statusText}`,
        details: errorText
      });
    }

    const data = await apiResponse.json();
    
    if (!data || (!data.output?.text && !data.message)) {
      console.error('Invalid API response:', data);
      return response.status(500).json({
        message: 'Invalid response from API'
      });
    }

    return response.status(200).json({
      response: data.output?.text || data.message
    });

  } catch (error) {
    console.error('Error details:', error);
    
    if (error.name === 'AbortError') {
      return response.status(504).json({
        message: 'Request timeout - the API took too long to respond'
      });
    }

    return response.status(500).json({
      message: 'Internal server error',
      details: error.message
    });
  }
} 