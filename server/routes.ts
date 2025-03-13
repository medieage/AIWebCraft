import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for chat and code generation
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, providerConfig } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!providerConfig || !providerConfig.apiKey) {
        return res.status(400).json({ error: "API key is required" });
      }

      let response;

      switch (providerConfig.provider) {
        case "gemini":
          response = await callGeminiAPI(message, providerConfig);
          break;
        case "openai":
          response = await callOpenAIAPI(message, providerConfig);
          break;
        case "anthropic":
          response = await callAnthropicAPI(message, providerConfig);
          break;
        case "mistral":
          response = await callMistralAPI(message, providerConfig);
          break;
        case "cohere":
          response = await callCohereAPI(message, providerConfig);
          break;
        default:
          return res.status(400).json({ error: "Unsupported provider" });
      }

      // Store chat message
      const sessionId = "session-" + Date.now();
      const userId = 1; // Default user for now

      // Extract code snippet using regex for JavaScript/React code blocks
      let code = "";
      const codeRegex = /```(?:jsx?|tsx?|javascript|typescript|react)([\s\S]*?)```/g;
      const matches = [...response.matchAll(codeRegex)];
      
      if (matches.length > 0) {
        code = matches.map(match => match[1].trim()).join("\n\n");
      }

      // Store the message
      await storage.createChatMessage({
        userId,
        sessionId,
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      });

      if (code) {
        await storage.createGeneratedCode({
          userId,
          sessionId,
          language: "javascript",
          code,
          timestamp: new Date().toISOString(),
        });
      }

      return res.json({ message: response, code });
    } catch (error) {
      console.error("Error in chat API:", error);
      return res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // API route for running code
  app.post("/api/run-code", async (req, res) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: "Code is required" });
      }

      // Basic HTML template for rendering React code
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Generated Website</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${code}
            
            // Render the component to the DOM
            const rootElement = document.getElementById('root');
            const root = ReactDOM.createRoot(rootElement);
            
            // Check if the code exports a default component
            if (typeof Home !== 'undefined') {
              root.render(<Home />);
            } else if (typeof App !== 'undefined') {
              root.render(<App />);
            } else if (typeof Main !== 'undefined') {
              root.render(<Main />);
            } else if (typeof default_1 !== 'undefined') {
              root.render(<default_1 />);
            } else {
              rootElement.innerHTML = '<div class="p-4 text-red-500">No React component found to render. Make sure you have a component named Home, App, or Main, or use export default.</div>';
            }
          </script>
        </body>
        </html>
      `;

      return res.json({ html });
    } catch (error) {
      console.error("Error running code:", error);
      return res.status(500).json({ error: "Failed to run code" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// API functions for different providers
async function callGeminiAPI(message: string, providerConfig: any) {
  try {
    const model = providerConfig.model || "gemini-2.0-pro-exp-02-05";
    const apiKey = providerConfig.apiKey;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${message}\n\nPlease provide the code implementation in JavaScript/React. Make sure to include the full component code in a code block using \`\`\`jsx and \`\`\` markers.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get response from Gemini API");
  }
}

async function callOpenAIAPI(message: string, providerConfig: any) {
  try {
    const model = providerConfig.model || "gpt-4";
    const apiKey = providerConfig.apiKey;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model,
        messages: [
          {
            role: "system",
            content: "You are an expert React and Next.js developer. Provide code with explanations when asked.",
          },
          {
            role: "user",
            content: `${message}\n\nPlease provide the code implementation in JavaScript/React. Make sure to include the full component code in a code block using \`\`\`jsx and \`\`\` markers.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error("Failed to get response from OpenAI API");
  }
}

async function callAnthropicAPI(message: string, providerConfig: any) {
  try {
    const model = providerConfig.model || "claude-3-sonnet";
    const apiKey = providerConfig.apiKey;

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model,
        messages: [
          {
            role: "user",
            content: `${message}\n\nPlease provide the code implementation in JavaScript/React. Make sure to include the full component code in a code block using \`\`\`jsx and \`\`\` markers.`,
          },
        ],
        max_tokens: 4000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": apiKey,
          "anthropic-version": "2023-06-01",
        },
      }
    );

    return response.data.content[0].text;
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    throw new Error("Failed to get response from Anthropic API");
  }
}

async function callMistralAPI(message: string, providerConfig: any) {
  try {
    const model = providerConfig.model || "mistral-large";
    const apiKey = providerConfig.apiKey;

    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model,
        messages: [
          {
            role: "system",
            content: "You are an expert React and Next.js developer. Provide code with explanations when asked.",
          },
          {
            role: "user",
            content: `${message}\n\nPlease provide the code implementation in JavaScript/React. Make sure to include the full component code in a code block using \`\`\`jsx and \`\`\` markers.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling Mistral API:", error);
    throw new Error("Failed to get response from Mistral API");
  }
}

async function callCohereAPI(message: string, providerConfig: any) {
  try {
    const model = providerConfig.model || "command-r";
    const apiKey = providerConfig.apiKey;

    const response = await axios.post(
      "https://api.cohere.ai/v1/generate",
      {
        model,
        prompt: `${message}\n\nPlease provide the code implementation in JavaScript/React. Make sure to include the full component code in a code block using \`\`\`jsx and \`\`\` markers.`,
        max_tokens: 4000,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return response.data.generations[0].text;
  } catch (error) {
    console.error("Error calling Cohere API:", error);
    throw new Error("Failed to get response from Cohere API");
  }
}
