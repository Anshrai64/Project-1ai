import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY is missing. Please add it to your environment variables.' }, { status: 500 });
    }

    const modelsToTry = [
      "google/gemma-4-31b-it:free",
      "nvidia/nemotron-3-super-120b-a12b:free",
      "liquid/lfm-2.5-1.2b-instruct:free",
      "poolside/laguna-m.1:free",
      "openai/gpt-oss-120b:free"
    ];

    let lastError = null;
    let lastErrorData = null;
    let lastStatus = 500;

    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
          }),
        });

        if (!response.ok) {
          lastErrorData = await response.text();
          lastStatus = response.status;
          console.error(`OpenRouter Error for model ${model}:`, lastErrorData);
          continue; // Try next model
        }

        const data = await response.json();
        if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
          return NextResponse.json({ reply: data.choices[0].message.content });
        } else {
          lastErrorData = JSON.stringify(data);
          lastStatus = 500;
          console.error(`Invalid response format for model ${model}:`, lastErrorData);
        }
      } catch (err) {
        lastError = err;
        console.error(`Fetch error for model ${model}:`, err);
      }
    }

    // If we exhausted all models, return the last error
    let errorMessage = 'Failed to fetch from OpenRouter after trying multiple free models.';
    if (lastErrorData) {
      try {
        const parsed = JSON.parse(lastErrorData as string);
        if (parsed.error && parsed.error.metadata && parsed.error.metadata.raw) {
          errorMessage = parsed.error.metadata.raw;
        } else if (parsed.error && parsed.error.message) {
          errorMessage = parsed.error.message;
        }
      } catch (e) {
        // ignore
      }
    }
    return NextResponse.json({ error: errorMessage, details: lastErrorData }, { status: lastStatus });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
