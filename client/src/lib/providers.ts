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
    description: "Мультимодальная AI-модель от Google для создания веб-сайтов",
    docsUrl: "https://ai.google.dev/docs/api/get-api-key",
    models: [
      { id: "gemini-2.0-pro-exp-02-05", name: "Gemini 2.0 Pro" },
      { id: "gemini-2.0-flash-thinking-exp-01-21", name: "Gemini 2.0 Flash" },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
      { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro" }
    ]
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Современные языковые модели для разработки сайтов",
    docsUrl: "https://platform.openai.com/api-keys",
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4-turbo", name: "GPT-4 Турбо" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Турбо" }
    ]
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Модели Claude для безопасной и полезной веб-разработки",
    docsUrl: "https://console.anthropic.com/keys",
    models: [
      { id: "claude-3-opus", name: "Claude 3 Опус" },
      { id: "claude-3-sonnet", name: "Claude 3 Соннет" },
      { id: "claude-3-haiku", name: "Claude 3 Хайку" }
    ]
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "Корпоративные языковые модели для создания веб-сайтов",
    docsUrl: "https://dashboard.cohere.com/api-keys",
    models: [
      { id: "command-r", name: "Command R" },
      { id: "command-r-plus", name: "Command R+" }
    ]
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "Открытые и эффективные модели для веб-разработки",
    docsUrl: "https://console.mistral.ai/api-keys/",
    models: [
      { id: "mistral-large", name: "Mistral Большой" },
      { id: "mistral-medium", name: "Mistral Средний" },
      { id: "mistral-small", name: "Mistral Малый" }
    ]
  }
];
