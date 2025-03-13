import { useState } from "react";
import ChatPanel from "./ChatPanel";
import CodeEditor from "./CodeEditor";
import PreviewPanel from "./PreviewPanel";
import { useCodeEditor } from "@/hooks/useCodeEditor";
import { useChat } from "@/hooks/useChat";
import { Provider } from "@/lib/providers";

interface ThreePanelProps {
  provider: Provider;
}

export default function ThreePanel({ provider }: ThreePanelProps) {
  // Состояние для предпросмотра
  const [previewHtml, setPreviewHtml] = useState<string>("");
  
  const { 
    code, 
    updateCode,
    activeFile,
    setActiveFile,
    files,
    addFile
  } = useCodeEditor();
  
  const {
    messages,
    addMessage,
    sendMessage,
    selectedModel,
    setSelectedModel,
    isLoading,
    models
  } = useChat({ 
    provider, 
    onCodeReceived: (newCode) => {
      updateCode(newCode);
      
      // При получении кода от ИИ, автоматически запускаем его в предпросмотре
      // с небольшой задержкой, чтобы дать время на рендеринг
      setTimeout(() => {
        handlePreviewUpdate(
          `<!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Предпросмотр</title>
            <style>
              body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
            </style>
          </head>
          <body>
            ${newCode}
          </body>
          </html>`
        );
      }, 500);
    }
  });
  
  // Обработчик обновления предпросмотра
  const handlePreviewUpdate = (html: string) => {
    setPreviewHtml(html);
  };
  
  return (
    <div className="grid lg:grid-cols-[1fr_1.5fr_1fr] gap-4 h-[calc(100vh-120px)]">
      <ChatPanel 
        provider={provider}
        messages={messages}
        addMessage={addMessage}
        sendMessage={sendMessage}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        isLoading={isLoading}
        models={models}
      />
      
      <CodeEditor 
        code={code}
        updateCode={updateCode}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
        files={files}
        addFile={addFile}
        onPreviewUpdate={handlePreviewUpdate}
      />
      
      <PreviewPanel html={previewHtml} />
    </div>
  );
}
