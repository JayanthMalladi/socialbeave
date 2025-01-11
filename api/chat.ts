export const config = {
  runtime: 'edge'
};

const BASE_API_URL = "https://api.langflow.astra.datastax.com";
const LANGFLOW_ID = "396deb1c-aadd-4f18-bd9e-a350c13098df";
const FLOW_ID = "bca2b923-d854-4755-86a8-0b51c350c42b";

export default async function handler(request: Request) {
  console.log('API Route Handler Started');

  if (request.method !== 'POST') {
    console.log('Invalid Method:', request.method);
    return new Response(
      JSON.stringify({ message: 'Method not allowed' }), 
      { status: 405 }
    );
  }

  try {
    console.log('Parsing request body...');
    const { message } = await request.json();
    console.log('Received message:', message);

    const token = process.env.ASTRA_DB_TOKEN;
    console.log('Token available:', !!token);

    if (!token) {
      console.error('API token not found in environment variables');
      return new Response(
        JSON.stringify({ 
          message: 'API token not configured',
          env: process.env // Log available env variables (be careful with sensitive data)
        }), 
        { status: 500 }
      );
    }

    const api_url = `${BASE_API_URL}/lf/${LANGFLOW_ID}/api/v1/run/${FLOW_ID}`;
    console.log('Making request to:', api_url);

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

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    const apiResponse = await fetch(api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    console.log('API Response Status:', apiResponse.status);
    console.log('API Response Headers:', JSON.stringify(Object.fromEntries(apiResponse.headers), null, 2));

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('API Error Response:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        body: errorText
      });

      return new Response(
        JSON.stringify({
          message: `API Error: ${apiResponse.statusText}`,
          details: errorText,
          debug: {
            status: apiResponse.status,
            headers: Object.fromEntries(apiResponse.headers)
          }
        }),
        { status: apiResponse.status }
      );
    }

    console.log('Parsing API response...');
    const data = await apiResponse.json();
    console.log('API Response Data:', JSON.stringify(data, null, 2));
    
    if (!data || (!data.output?.text && !data.message)) {
      console.error('Invalid API response structure:', data);
      return new Response(
        JSON.stringify({ 
          message: 'Invalid response from API',
          debug: { receivedData: data }
        }), 
        { status: 500 }
      );
    }

    console.log('Sending successful response');
    return new Response(
      JSON.stringify({
        response: data.output?.text || data.message,
        debug: { 
          responseType: data.output?.text ? 'output.text' : 'message',
          fullResponse: data
        }
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
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return new Response(
      JSON.stringify({
        message: 'Internal server error',
        details: error.message,
        debug: {
          errorName: error.name,
          errorStack: error.stack,
          errorCause: error.cause
        }
      }),
      { status: 500 }
    );
  }
} 