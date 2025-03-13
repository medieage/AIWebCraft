import { useState } from "react";
import ThreePanel from "@/components/ThreePanel";
import APIKeyModal from "@/components/APIKeyModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ProviderDropdown from "@/components/ProviderDropdown";
import { providers } from "@/lib/providers";
import { useApiKeys } from "@/hooks/useApiKeys";

export default function Home() {
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState(providers[0]);
  const { apiKeysQuery } = useApiKeys();
  
  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex items-center gap-2 mr-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-white"
              >
                <path d="m9 19-5-5 5-5" />
                <path d="m15 5 5 5-5 5" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              ИИ Генератор Сайтов
            </span>
          </div>
          
          <div className="flex items-center ml-auto space-x-4">
            <Button 
              onClick={() => setIsKeyModalOpen(true)}
              variant="outline"
              className="border-purple-500 text-purple-500 hover:bg-purple-500/20"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-1"
              >
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
              API Keys
            </Button>
            
            <ProviderDropdown 
              providers={providers}
              activeProvider={activeProvider}
              onChange={setActiveProvider}
              apiKeysQuery={apiKeysQuery}
            />
            
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-1"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              Templates
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container pt-6 pb-8 max-w-screen-2xl">
        <ThreePanel provider={activeProvider} />
      </main>
      
      {/* API Key Modal */}
      <APIKeyModal 
        isOpen={isKeyModalOpen} 
        onClose={() => setIsKeyModalOpen(false)} 
        providers={providers}
      />
    </div>
  );
}
