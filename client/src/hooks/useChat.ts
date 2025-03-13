import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Provider } from '@/lib/providers';
import { apiRequest } from '@/lib/queryClient';
import { Message } from '@/components/ChatPanel';

interface UseChatOptions {
  provider: Provider;
  onCodeReceived?: (code: string) => void;
}

export function useChat({ provider, onCodeReceived }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(provider.models[0].id);
  
  // Update selected model when provider changes
  if (provider.models.length > 0 && !provider.models.some(m => m.id === selectedModel)) {
    setSelectedModel(provider.models[0].id);
  }
  
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);
  
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    addMessage({ role: 'user', content });
    
    setIsLoading(true);
    try {
      // Send to backend
      const response = await apiRequest('POST', `/api/chat/${provider.id}`, {
        prompt: content,
        model: selectedModel
      });
      
      const data = await response.json();
      
      // Extract text from AI provider response format
      let responseText = '';
      
      if (provider.id === 'gemini' && data.candidates) {
        // Improved Gemini response handling
        const candidate = data.candidates[0];
        if (candidate?.content?.parts) {
          // Collect all text parts from the response
          responseText = candidate.content.parts
            .map((part: any) => part.text || '')
            .join('\n');
        } else {
          console.warn('Unexpected Gemini response format:', data);
          responseText = "Sorry, I couldn't understand the AI's response format.";
        }
      } else if (provider.id === 'gemini' && data.error) {
        // Handle error in Gemini response
        console.error('Gemini API error:', data.error);
        const errorMessage = data.error.message || data.details || JSON.stringify(data.error);
        throw new Error(`Gemini API Error: ${errorMessage}`);
      } else {
        // Handle other providers' response formats
        responseText = data.message || JSON.stringify(data);
      }
      
      // Debug output
      console.log('Processed AI response:', { provider: provider.id, success: true, responseLength: responseText.length });
      
      // Look for code blocks in the response
      const codeBlockRegex = /```(?:jsx?|tsx?|html)?\n([\s\S]*?)\n```/g;
      const codeBlocks = Array.from(responseText.matchAll(codeBlockRegex));
      
      if (codeBlocks.length > 0 && onCodeReceived) {
        // If there are code blocks, send the first one to the code editor
        const codeContent = codeBlocks[0][1].trim();
        console.log('Found code block, length:', codeContent.length);
        onCodeReceived(codeContent);
      }
      
      // Add assistant message
      addMessage({ role: 'assistant', content: responseText });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
        
      addMessage({ 
        role: 'assistant', 
        content: `Sorry, there was an error processing your request: ${errorMessage}. Please check your API key and try again.`
      });
    } finally {
      setIsLoading(false);
    }
  }, [provider, selectedModel, addMessage, onCodeReceived]);
  
  return {
    messages,
    addMessage,
    sendMessage,
    isLoading,
    selectedModel,
    setSelectedModel,
    models: provider.models
  };
}
