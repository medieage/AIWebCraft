import { ProviderConfig } from "./provider-config";

export async function generateCode(
  message: string,
  providerConfig: ProviderConfig
): Promise<{ message: string; code: string }> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        providerConfig,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating code:", error);
    throw error;
  }
}

export async function runCode(code: string): Promise<{ html: string }> {
  try {
    const response = await fetch("/api/run-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error running code:", error);
    throw error;
  }
}
