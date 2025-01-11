import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE_API_URL = "https://api.langflow.astra.datastax.com";
const LANGFLOW_ID = "396deb1c-aadd-4f18-bd9e-a350c13098df";
const FLOW_ID = "bca2b923-d854-4755-86a8-0b51c350c42b";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message } = request.body;
    const token = process.env.VITE_ASTRA_DB_TOKEN;

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

    const apiResponse = await fetch(api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await apiResponse.json();

    return response.status(200).json({
      response: data.output?.text || data.message || "Sorry, I couldn't process that request."
    });
  } catch (error) {
    console.error('Error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
} 