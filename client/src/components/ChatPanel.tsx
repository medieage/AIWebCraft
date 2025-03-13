import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ModelSelector from "./ModelSelector";
import { MessageSquare, User, SendHorizontal, MoreVertical } from "lucide-react";
import { Provider } from "@/lib/providers";
import { useToast } from "@/hooks/use-toast";

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

interface ChatPanelProps {
  provider: Provider;
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  sendMessage: (content: string) => Promise<void>;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  isLoading: boolean;
  models: { id: string; name: string }[];
}

export default function ChatPanel({
  provider,
  messages,
  addMessage,
  sendMessage,
  selectedModel,
  setSelectedModel,
  isLoading,
  models
}: ChatPanelProps) {
  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    try {
      const userMessage = prompt;
      setPrompt("");
      await sendMessage(userMessage);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="flex flex-col h-full shadow-[0_0_15px_rgba(139,92,246,0.3)] relative overflow-hidden border-purple-500/30 before:absolute before:inset-0 before:-z-10 before:bg-[linear-gradient(rgba(139,92,246,0.1),rgba(59,130,246,0.1),rgba(139,92,246,0.1))] before:opacity-30 before:animate-[spin_6s_linear_infinite]">
      <CardHeader className="border-b border-border/40 px-4 py-3 space-y-0 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-500" />
          <CardTitle className="text-base font-medium">AI Chat</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <ModelSelector 
            models={models}
            selectedModel={selectedModel}
            onChange={setSelectedModel}
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>Start a conversation with {provider.name}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
              )}
              
              <div 
                className={`p-3 rounded-lg max-w-[85%] ${
                  message.role === 'user' 
                    ? 'bg-blue-500/20 border border-blue-500/40 rounded-tr-none' 
                    : 'bg-muted rounded-tl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              
              {message.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      
      <CardFooter className="p-3 border-t border-border/40">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative">
            <Input
              placeholder={`Ask me to build something with Next.js & React...`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              className="w-full bg-muted rounded-full pr-12 focus:ring-purple-500"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !prompt.trim()}
              className="absolute right-1 top-1 h-8 w-8 rounded-full bg-purple-500 text-white hover:bg-purple-600"
            >
              <SendHorizontal className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex justify-center mt-2">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              {!provider.hasKey ? "API Key required to use AI features" : "Messages may be logged for service improvements"}
            </div>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
