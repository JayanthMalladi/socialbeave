export const config = {
  runtime: 'edge'
};

const BASE_API_URL = "https://api.langflow.astra.datastax.com";
const LANGFLOW_ID = "396deb1c-aadd-4f18-bd9e-a350c13098df";
const FLOW_ID = "bca2b923-d854-4755-86a8-0b51c350c42b";

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ message: 'Method not allowed' }), 
      { status: 405 }
    );
  }

  try {
    const { message } = await request.json();
    const token = process.env.ASTRA_DB_TOKEN;

    if (!token) {
      return new Response(
        JSON.stringify({ message: 'API token not configured' }), 
        { status: 500 }
      );
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

    const apiResponse = await fetch(api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return new Response(
        JSON.stringify({
          message: `API Error: ${apiResponse.statusText}`,
          details: errorText
        }),
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();
    
    if (!data || (!data.output?.text && !data.message)) {
      return new Response(
        JSON.stringify({ message: 'Invalid response from API' }), 
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        response: data.output?.text || data.message
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );

  } catch (error) {
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({
        message: 'Internal server error',
        details: error.message
      }),
      { status: 500 }
    );
  }
} 