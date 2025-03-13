import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask anything about your website..."
        className="flex-1 bg-gray-900 bg-opacity-50 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      <Button 
        type="submit" 
        className="bg-gradient-to-r from-blue-400 to-purple-600 text-white px-4 py-2 rounded-r-md hover:opacity-90 transition-opacity"
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}
