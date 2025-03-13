import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { MessageRole } from "@shared/schema";
import { Settings } from "lucide-react";
import { ProviderSettings } from "../providers/provider-settings";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ProviderConfig } from "@/lib/provider-config";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

interface ChatPanelProps {
  onCodeUpdate: (code: string) => void;
  providerConfig: ProviderConfig;
  setProviderConfig: (config: ProviderConfig) => void;
}

export function ChatPanel({ onCodeUpdate, providerConfig, setProviderConfig }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-1",
      role: "system",
      content: "Я ваш ИИ-ассистент по созданию веб-сайтов на Next.js и React. Расскажите, какой сайт вы хотите создать!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      if (!providerConfig.apiKey) {
        setIsTyping(false);
        setSettingsOpen(true);
        toast({
          title: "Требуется API Ключ",
          description: "Пожалуйста, установите ключ API для продолжения работы.",
          variant: "destructive",
        });
        return;
      }

      const response = await apiRequest("POST", "/api/chat", {
        message: content,
        providerConfig,
      });

      const data = await response.json();
      
      setIsTyping(false);
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      if (data.code) {
        onCodeUpdate(data.code);
      }
    } catch (error) {
      setIsTyping(false);
      toast({
        title: "Ошибка",
        description: "Не удалось получить ответ от провайдера ИИ. Пожалуйста, проверьте ваш API ключ.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="flex-1 flex flex-col overflow-hidden glassmorphism bg-[#121212] bg-opacity-50 backdrop-blur-xl border-[1px] border-[rgba(255,255,255,0.1)] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative">
        <div className="absolute top-0 left-0 right-0 bottom-0 border-[1px] border-transparent pointer-events-none z-10" 
             style={{ borderImage: "linear-gradient(135deg, #00b3ff, #9f00ff) 1" }} />
        
        <CardHeader className="p-4 border-b border-gray-800 flex justify-between items-center">
          <CardTitle className="text-lg flex items-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            ИИ Ассистент
          </CardTitle>
          <div className="flex space-x-2">
            <button 
              className="text-blue-400 hover:text-white transition-colors"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent 
          ref={chatContainerRef} 
          className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gradient"
        >
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              provider={providerConfig.provider}
            />
          ))}
          
          {isTyping && (
            <div className="flex">
              <div className="max-w-[80%] p-3 rounded-lg bg-[rgba(26,27,75,0.25)] border border-[rgba(255,255,255,0.1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-[rgba(0,179,255,0.2)] to-[rgba(159,0,255,0.2)] z-[-1]" />
                <p className="text-xs text-blue-400 mb-1 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  {providerConfig.provider.toUpperCase()}
                </p>
                <div className="flex space-x-1 items-center">
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 border-t border-gray-800">
          <ChatInput onSendMessage={handleSendMessage} />
        </CardFooter>
      </Card>

      <ProviderSettings 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
        providerConfig={providerConfig}
        setProviderConfig={setProviderConfig}
      />
    </>
  );
}
