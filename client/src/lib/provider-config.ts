export interface ProviderConfig {
  provider: string;
  apiKey: string;
  model?: string;
}

export const supportedProviders = [
  { value: "gemini", label: "Google Gemini" },
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic Claude" },
  { value: "mistral", label: "Mistral AI" },
  { value: "cohere", label: "Cohere" },
];

export const defaultModels: Record<string, string[]> = {
  gemini: [
    "gemini-2.0-pro-exp-02-05",
    "gemini-2.0-flash-thinking-exp-01-21",
    "gemini-1.5-pro",
    "gemini-1.0",
  ],
  openai: [
    "gpt-4o",
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo",
  ],
  anthropic: [
    "claude-3-opus",
    "claude-3-sonnet",
    "claude-3-haiku",
    "claude-2",
  ],
  mistral: [
    "mistral-large",
    "mistral-medium",
    "mistral-small",
  ],
  cohere: [
    "command-r",
    "command-light",
  ],
};

export const defaultProviderConfig: ProviderConfig = {
  provider: "gemini",
  apiKey: "",
  model: "gemini-2.0-pro-exp-02-05",
};
