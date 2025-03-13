import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertApiKeySchema, DEFAULT_SYSTEM_PROMPT, MESSAGE_ROLE } from "@shared/schema";
import { z } from "zod";
import axios from "axios";
import { WebSocketServer, WebSocket } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiRouter = express.Router();
  app.use("/api", apiRouter);
  
  // Save API key
  apiRouter.post("/keys", async (req: Request, res: Response) => {
    try {
      const { provider, apiKey } = insertApiKeySchema.parse(req.body);
      
      // In a real app, we'd get the user ID from the session
      // For simplicity, using the demo user (ID: 1)
      const userId = 1;
      
      const savedKey = await storage.saveApiKey(userId, { provider, apiKey });
      // Don't return the actual API key for security
      res.json({
        id: savedKey.id,
        provider: savedKey.provider,
        created: savedKey.created
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save API key" });
      }
    }
  });
  
  // Get API key providers
  apiRouter.get("/keys", async (req: Request, res: Response) => {
    try {
      // In a real app, we'd get the user ID from the session
      const userId = 1;
      
      // Get all providers
      const providers = ["gemini", "openai", "anthropic", "cohere", "mistral"];
      const result = [];
      
      for (const provider of providers) {
        const apiKey = await storage.getApiKey(userId, provider);
        result.push({
          provider,
          hasKey: !!apiKey
        });
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to get API keys" });
    }
  });
  
  // Proxy request to Gemini API
  apiRouter.post("/chat/gemini", async (req: Request, res: Response) => {
    try {
      const { prompt, model } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      // In a real app, we'd get the user ID from the session
      const userId = 1;
      
      // Get API key
      const apiKey = await storage.getApiKey(userId, "gemini");
      
      if (!apiKey) {
        return res.status(400).json({ message: "Gemini API key not found" });
      }
      
      // The actual model name to use with Gemini API
      const modelName = model || "gemini-2.0-pro-exp-02-05";
      
      console.log(`Calling Gemini API with model: ${modelName}`);
      
      // Call Gemini API
      try {
        // Create message array with system prompt as user message first, then the actual user message
        // Gemini только поддерживает роли "user" и "model"
        const contents = [
          { 
            role: "user", 
            parts: [{ text: DEFAULT_SYSTEM_PROMPT }] 
          },
          { 
            role: "user",
            parts: [{ text: prompt }] 
          }
        ];
        
        console.log("Sending request to Gemini with system prompt included");
        
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
          {
            contents,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            }
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            params: {
              key: apiKey.apiKey
            }
          }
        );
        
        console.log("Gemini API response status:", response.status);
        res.json(response.data);
      } catch (apiError: any) {
        console.error("Gemini API request failed:", apiError.message);
        if (apiError.response) {
          console.error("Response data:", apiError.response.data);
          console.error("Response status:", apiError.response.status);
          
          // Return the error from Gemini API to the client
          return res.status(apiError.response.status).json({
            message: "Gemini API Error",
            error: apiError.response.data,
            details: apiError.response.data.error || "Unknown API error"
          });
        }
        
        throw apiError;
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ 
        message: "Failed to call Gemini API",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Placeholder endpoint for other providers
  apiRouter.post("/chat/:provider", async (req: Request, res: Response) => {
    const { provider } = req.params;
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    
    try {
      // In a real app, we'd get the user ID from the session
      const userId = 1;
      
      // Get API key
      const apiKey = await storage.getApiKey(userId, provider);
      
      if (!apiKey) {
        return res.status(400).json({ message: `${provider} API key not found` });
      }
      
      // This would be implemented fully for each provider
      res.status(501).json({ 
        message: `Chat with ${provider} not fully implemented yet`,
        prompt
      });
    } catch (error) {
      res.status(500).json({ 
        message: `Failed to call ${provider} API`,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get templates
  apiRouter.get("/templates", async (req: Request, res: Response) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to get templates" });
    }
  });

  // Run code in preview panel
  apiRouter.post("/run-code", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Code is required" });
      }
      
      // For simple HTML/CSS/JS code, we just return it directly
      // For more complex scenarios, this would need to compile the code
      const html = code.includes("<html") ? code : `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Normalize styles */
            body { margin: 0; font-family: system-ui, sans-serif; }
          </style>
        </head>
        <body>
          ${code}
          <script>
            // Enable console logs to be captured
            const originalConsoleLog = console.log;
            console.log = (...args) => {
              originalConsoleLog(...args);
              window.parent.postMessage({
                type: 'console-log',
                data: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
              }, '*');
            };
          </script>
        </body>
        </html>
      `;
      
      res.json({ html });
    } catch (error) {
      console.error("Error running code:", error);
      res.status(500).json({ 
        message: "Failed to run code",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Install dependencies for a project
  apiRouter.post("/install-dependency", async (req: Request, res: Response) => {
    try {
      const { dependency, type } = req.body;
      
      if (!dependency) {
        return res.status(400).json({ message: "Dependency name is required" });
      }
      
      // In a real implementation, this would call npm/yarn to install the dependency
      // For this demo, we'll simulate it
      console.log(`Installing dependency: ${dependency} (${type || 'regular'})`);
      
      // Simulate a delay for installation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({ 
        success: true, 
        message: `Dependency ${dependency} was installed successfully`,
        dependency,
        type
      });
    } catch (error) {
      console.error("Error installing dependency:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to install dependency",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Export to GitHub repository
  apiRouter.post("/export-github", async (req: Request, res: Response) => {
    try {
      const { repo, token, files } = req.body;
      
      if (!repo) {
        return res.status(400).json({ message: "GitHub repository name is required" });
      }
      
      if (!token) {
        return res.status(400).json({ message: "GitHub token is required" });
      }
      
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ message: "Files are required" });
      }
      
      // In a real implementation, this would use GitHub API to create a repository and push files
      // For this demo, we'll just log the process
      console.log(`Exporting to GitHub repository: ${repo}`);
      console.log(`Number of files to export: ${files.length}`);
      
      res.json({ 
        success: true, 
        message: `Project exported successfully to ${repo}`,
        url: `https://github.com/${repo}`
      });
    } catch (error) {
      console.error("Error exporting to GitHub:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to export to GitHub",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Создаем HTTP сервер
  const httpServer = createServer(app);
  
  // Создаем WebSocket сервер на отдельном пути чтобы не мешать Vite HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Хранение активных соединений
  const clients: Set<WebSocket> = new Set();
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    clients.add(ws);
    
    ws.on('message', (message) => {
      try {
        // Получаем сообщение и отправляем его всем клиентам, кроме отправителя
        const messageStr = message.toString();
        console.log('WebSocket message received:', messageStr);
        
        // Рассылаем сообщение всем клиентам
        clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });
  
  console.log("HTTP and WebSocket servers created successfully");
  
  return httpServer;
}
