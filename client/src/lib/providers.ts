export interface Provider {
  id: string;
  name: string;
  description: string;
  docsUrl: string;
  models: { id: string; name: string }[];
  hasKey?: boolean;
}

export const providers: Provider[] = [
  {
    id: "gemini",
    name: "Gemini",
    description: "Google's multimodal AI model",
    docsUrl: "https://ai.google.dev/docs/api/get-api-key",
    models: [
      { id: "gemini-2.0-pro-exp-02-05", name: "gemini-2.0-pro-exp-02-05" },
      { id: "gemini-2.0-flash-thinking-exp-01-21", name: "gemini-2.0-flash-thinking-exp-01-21" },
      { id: "gemini-1.5-pro", name: "gemini-1.5-pro" },
      { id: "gemini-1.0-pro", name: "gemini-1.0-pro" }
    ]
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "State-of-the-art language models",
    docsUrl: "https://platform.openai.com/api-keys",
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" }
    ]
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude models for safe and helpful AI",
    docsUrl: "https://console.anthropic.com/keys",
    models: [
      { id: "claude-3-opus", name: "Claude 3 Opus" },
      { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
      { id: "claude-3-haiku", name: "Claude 3 Haiku" }
    ]
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "Enterprise-ready language models",
    docsUrl: "https://dashboard.cohere.com/api-keys",
    models: [
      { id: "command-r", name: "Command R" },
      { id: "command-r-plus", name: "Command R+" }
    ]
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "Open and efficient language models",
    docsUrl: "https://console.mistral.ai/api-keys/",
    models: [
      { id: "mistral-large", name: "Mistral Large" },
      { id: "mistral-medium", name: "Mistral Medium" },
      { id: "mistral-small", name: "Mistral Small" }
    ]
  }
];
