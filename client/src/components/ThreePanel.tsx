import { useState } from "react";
import ChatPanel from "./ChatPanel";
import CodeEditor from "./CodeEditor";
import PreviewPanel from "./PreviewPanel";
import { useCodeEditor } from "@/hooks/useCodeEditor";
import { useChat } from "@/hooks/useChat";
import { usePreview } from "@/hooks/usePreview";
import { Provider } from "@/lib/providers";

interface ThreePanelProps {
  provider: Provider;
}

export default function ThreePanel({ provider }: ThreePanelProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [activeTabs, setActiveTabs] = useState([{ name: 'index.js', content: '' }]);
  
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
  } = useChat({ provider, onCodeReceived: updateCode });
  
  const { previewHtml } = usePreview({ code });
  
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
      />
      
      <PreviewPanel html={previewHtml} />
    </div>
  );
}
