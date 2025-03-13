import { useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, FileCode, PlusCircle, Clipboard, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Editor } from "@monaco-editor/react";
import { loadMonacoTheme } from "@/lib/monaco";

export type FileTab = {
  name: string;
  content: string;
};

interface CodeEditorProps {
  code: string;
  updateCode: (newCode: string) => void;
  activeFile: string;
  setActiveFile: (filename: string) => void;
  files: FileTab[];
  addFile: (name: string, content: string) => void;
}

export default function CodeEditor({
  code,
  updateCode,
  activeFile,
  setActiveFile,
  files,
  addFile
}: CodeEditorProps) {
  const { toast } = useToast();
  const editorRef = useRef<any>(null);
  
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    // Load custom theme
    loadMonacoTheme(editor);
  };
  
  const handleRunCode = () => {
    try {
      // This would run the code in a sandbox or update the preview
      toast({
        title: "Running code",
        description: "Your code is being executed in the preview panel.",
      });
    } catch (error) {
      toast({
        title: "Error running code",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      toast({
        title: "Copied to clipboard",
        description: "The code has been copied to your clipboard.",
      });
    }
  };
  
  const handleAddFile = () => {
    const fileName = prompt("Enter file name:", "NewComponent.jsx");
    if (fileName) {
      addFile(fileName, "// Your code here");
      setActiveFile(fileName);
    }
  };
  
  return (
    <Card className="flex flex-col h-full shadow-[0_0_15px_rgba(59,130,246,0.3)] relative overflow-hidden border-blue-500/30 before:absolute before:inset-0 before:-z-10 before:bg-[linear-gradient(rgba(59,130,246,0.1),rgba(139,92,246,0.1),rgba(59,130,246,0.1))] before:opacity-30 before:animate-[spin_6s_linear_infinite]">
      <CardHeader className="border-b border-border/40 px-4 py-3 space-y-0 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-base font-medium">Code Editor</CardTitle>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={handleRunCode}
            className="h-8 text-xs bg-blue-500/20 text-blue-500 border border-blue-500/40 hover:bg-blue-500/30"
          >
            <Play className="h-3 w-3 mr-1" />
            Run
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 text-xs"
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.getAction('editor.action.formatDocument').run();
              }
            }}
          >
            Format
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 text-xs"
            onClick={handleCopyCode}
          >
            <Clipboard className="h-3 w-3 mr-1" />
            Copy
          </Button>
        </div>
      </CardHeader>
      
      <div className="flex border-b border-border/40 overflow-x-auto">
        {files.map((file) => (
          <Button
            key={file.name}
            variant="ghost"
            className={`h-9 px-4 py-2 text-sm rounded-none ${
              file.name === activeFile 
                ? 'border-b-2 border-blue-500 text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveFile(file.name)}
          >
            <FileCode className="h-4 w-4 mr-1" />
            {file.name}
          </Button>
        ))}
        <Button
          variant="ghost"
          className="h-9 px-2 py-2 text-muted-foreground hover:text-foreground ml-auto rounded-none"
          onClick={handleAddFile}
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onChange={(value) => updateCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            tabSize: 2,
            fontFamily: "'JetBrains Mono', monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on",
            padding: { top: 16 }
          }}
          onMount={handleEditorDidMount}
        />
      </CardContent>
    </Card>
  );
}
