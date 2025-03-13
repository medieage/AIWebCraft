import { useState, useEffect } from "react";
import { ThreePanelLayout } from "@/components/layout/three-panel-layout";
import { ChatPanel } from "@/components/chat/chat-panel";
import { CodeEditor } from "@/components/ui/code-editor";
import { PreviewPanel } from "@/components/preview/preview-panel";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { defaultProviderConfig } from "@/lib/provider-config";

export default function Home() {
  const [code, setCode] = useState<string>(`// Welcome to AI Website Generator!
// Chat with the AI assistant to start generating a website.
// The code will appear here and the preview will update in real-time.

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="text-center text-white p-8 max-w-lg">
        <h1 className="text-4xl font-bold mb-4">Welcome to AI Website Generator</h1>
        <p className="text-xl mb-6">
          Ask the AI to create a website for you, and watch it build in real-time!
        </p>
        <div className="bg-white bg-opacity-20 p-4 rounded-lg">
          <p className="text-sm">
            Try asking: "Create a simple e-commerce landing page with a hero section, 
            featured products grid, and a newsletter signup form."
          </p>
        </div>
      </div>
    </div>
  );
}`);
  
  const [html, setHtml] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [providerConfig, setProviderConfig] = useState(defaultProviderConfig);
  const { toast } = useToast();

  const runCodeMutation = useMutation({
    mutationFn: async (codeToRun: string) => {
      const response = await apiRequest("POST", "/api/run-code", { code: codeToRun });
      return response.json();
    },
    onSuccess: (data) => {
      setHtml(data.html);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to run the code. Please check for syntax errors.",
        variant: "destructive",
      });
    },
  });

  // Initial run to populate preview
  useEffect(() => {
    runCodeMutation.mutate(code);
  }, []);

  const handleCodeUpdate = (newCode: string) => {
    setCode(newCode);
  };

  const handleRunCode = () => {
    runCodeMutation.mutate(code);
  };

  return (
    <ThreePanelLayout
      chatPanel={
        <ChatPanel 
          onCodeUpdate={handleCodeUpdate} 
          providerConfig={providerConfig}
          setProviderConfig={setProviderConfig}
        />
      }
      codePanel={
        <CodeEditor
          code={code}
          language={language}
          onChange={handleCodeUpdate}
          onRun={handleRunCode}
        />
      }
      previewPanel={
        <PreviewPanel 
          html={html} 
          isLoading={runCodeMutation.isPending}
        />
      }
    />
  );
}
