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
      
      // Extract text from Gemini response format
      let responseText = '';
      
      if (provider.id === 'gemini' && data.candidates) {
        responseText = data.candidates[0]?.content?.parts[0]?.text || "Sorry, I couldn't generate a response.";
      } else {
        // Handle other providers' response formats
        responseText = data.message || JSON.stringify(data);
      }
      
      // Look for code blocks in the response
      const codeBlockRegex = /```(?:jsx?|tsx?|html)?\n([\s\S]*?)\n```/g;
      const codeBlocks = Array.from(responseText.matchAll(codeBlockRegex));
      
      if (codeBlocks.length > 0 && onCodeReceived) {
        // If there are code blocks, send the first one to the code editor
        onCodeReceived(codeBlocks[0][1]);
      }
      
      // Add assistant message
      addMessage({ role: 'assistant', content: responseText });
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({ 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please check your API key and try again.'
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
