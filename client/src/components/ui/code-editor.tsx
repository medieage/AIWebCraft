import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Play, File, Folder, ChevronRight, ChevronDown, ChevronLeft } from "lucide-react";

// Fix for Monaco Editor Web Workers
self.MonacoEnvironment = {
  getWorkerUrl: function (_moduleId: string, label: string) {
    if (label === 'json') {
      return './json.worker.js';
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return './css.worker.js';
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return './html.worker.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.js';
    }
    return './editor.worker.js';
  }
};

// Sample project structure
const projectFiles: FileItem[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      {
        name: 'components',
        type: 'folder',
        children: [
          { name: 'Header.jsx', type: 'file', language: 'javascript' },
          { name: 'Footer.jsx', type: 'file', language: 'javascript' },
          { name: 'Navigation.jsx', type: 'file', language: 'javascript' },
        ]
      },
      {
        name: 'pages',
        type: 'folder',
        children: [
          { name: 'index.jsx', type: 'file', language: 'javascript' },
          { name: 'about.jsx', type: 'file', language: 'javascript' },
          { name: 'contact.jsx', type: 'file', language: 'javascript' },
        ]
      },
      {
        name: 'styles',
        type: 'folder',
        children: [
          { name: 'global.css', type: 'file', language: 'css' },
          { name: 'Home.module.css', type: 'file', language: 'css' },
        ]
      },
    ]
  },
  {
    name: 'public',
    type: 'folder',
    children: [
      { name: 'favicon.ico', type: 'file', language: 'binary' },
      { name: 'logo.svg', type: 'file', language: 'xml' },
    ]
  },
  { name: 'package.json', type: 'file', language: 'json' },
  { name: 'next.config.js', type: 'file', language: 'javascript' },
  { name: 'README.md', type: 'file', language: 'markdown' },
];

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  language?: string;
  children?: FileItem[];
}

interface FileTreeProps {
  files: FileItem[];
  onSelectFile: (fileName: string, language: string) => void;
  level?: number;
}

function FileTree({ files, onSelectFile, level = 0 }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'src': true, // Default expanded
  });

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  return (
    <ul className={`${level === 0 ? 'mt-2' : 'ml-3 pl-2 border-l border-gray-700'}`}>
      {files.map((item) => (
        <li key={item.name} className="my-1">
          {item.type === 'folder' ? (
            <div>
              <div 
                className="flex items-center text-gray-300 hover:text-white cursor-pointer py-1"
                onClick={() => toggleFolder(item.name)}
              >
                {expandedFolders[item.name] ? (
                  <ChevronDown className="h-3.5 w-3.5 mr-1 text-gray-500" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 mr-1 text-gray-500" />
                )}
                <Folder className="h-4 w-4 mr-1.5 text-blue-400" />
                <span className="text-sm">{item.name}</span>
              </div>
              {expandedFolders[item.name] && item.children && (
                <FileTree 
                  files={item.children} 
                  onSelectFile={onSelectFile} 
                  level={level + 1} 
                />
              )}
            </div>
          ) : (
            <div 
              className="flex items-center text-gray-400 hover:text-white cursor-pointer py-1 ml-4"
              onClick={() => item.language && onSelectFile(item.name, item.language)}
            >
              <File className="h-4 w-4 mr-1.5 text-purple-400" />
              <span className="text-sm">{item.name}</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  onRun: () => void;
  fileName?: string;
}

export function CodeEditor({ code, language, onChange, onRun, fileName = "index.jsx" }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [currentFileName, setCurrentFileName] = useState(fileName);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [showFileTree, setShowFileTree] = useState(true);

  const handleSelectFile = (fileName: string, language: string) => {
    setCurrentFileName(fileName);
    setCurrentLanguage(language);
    // In a real app, we would load the file content here
  };

  useEffect(() => {
    if (editorRef.current) {
      // Configure Monaco Editor
      const editor = monaco.editor.create(editorRef.current, {
        value: code,
        language: currentLanguage,
        theme: "vs-dark",
        automaticLayout: true,
        minimap: {
          enabled: false,
        },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: "'JetBrains Mono', monospace",
        lineNumbers: "on",
        scrollbar: {
          useShadows: false,
          verticalScrollbarSize: 6,
          horizontalScrollbarSize: 6,
        },
        // Russian language settings for Monaco UI
        'semanticHighlighting.enabled': true,
      });

      monacoRef.current = editor;

      editor.onDidChangeModelContent(() => {
        onChange(editor.getValue());
      });

      return () => {
        editor.dispose();
      };
    }
  }, [currentLanguage]);

  useEffect(() => {
    if (monacoRef.current && code !== monacoRef.current.getValue()) {
      monacoRef.current.setValue(code);
    }
  }, [code]);

  return (
    <Card className="flex flex-col h-full overflow-hidden bg-[#121212] glassmorphism neon-border">
      <CardHeader className="border-b border-gray-800 p-4 flex flex-row justify-between items-center">
        <CardTitle className="text-lg flex items-center text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-electric-purple"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <span>Редактор кода</span>
        </CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-purple-800 bg-opacity-30 text-white text-xs px-2 py-1 h-auto"
          >
            {currentFileName}
          </Button>
        </div>
      </CardHeader>
      <div className="flex flex-1 overflow-hidden">
        {showFileTree && (
          <div className="w-56 border-r border-gray-800 p-2 overflow-y-auto bg-[#1a1a1a]">
            <div className="text-sm font-medium text-gray-200 mb-1 flex items-center justify-between">
              <span>Структура проекта</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setShowFileTree(false)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <FileTree files={projectFiles} onSelectFile={handleSelectFile} />
          </div>
        )}
        <CardContent className={`flex-1 p-0 overflow-hidden ${!showFileTree ? 'border-l border-gray-800' : ''}`}>
          {!showFileTree && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 m-1 bg-gray-800 bg-opacity-50"
              onClick={() => setShowFileTree(true)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <div ref={editorRef} className="h-full w-full" />
        </CardContent>
      </div>
      <CardFooter className="border-t border-gray-800 p-3 flex justify-between items-center">
        <div>
          <span className="text-xs text-gray-400">Next.js 13.4.9 · React 18.2.0</span>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            className="bg-purple-700 text-white text-sm hover:bg-purple-600 px-3 py-1.5 h-auto" 
            onClick={() => {}}
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            <span>Форматировать</span>
          </Button>
          <Button 
            className="bg-blue-600 text-white text-sm hover:bg-blue-500 px-3 py-1.5 h-auto" 
            onClick={onRun}
          >
            <Play className="h-4 w-4 mr-1" />
            <span>Запустить</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
