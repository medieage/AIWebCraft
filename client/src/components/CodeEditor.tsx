import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Play, FileCode, PlusCircle, Clipboard, Code2, Folder, FolderPlus, 
  Download, Github, Package, RefreshCcw, ChevronRight, ChevronDown, File, Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Editor } from "@monaco-editor/react";
import { loadMonacoTheme } from "@/lib/monaco";
import { runCode } from "@/lib/api";

// Типы файлов и папок для древовидной структуры
export type FileNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileNode[];
  parentId?: string | null;
  isExpanded?: boolean;
};

export type FileTab = {
  name: string;
  content: string;
  id: string;
};

interface CodeEditorProps {
  code: string;
  updateCode: (newCode: string) => void;
  activeFile: string;
  setActiveFile: (filename: string) => void;
  files: FileTab[];
  addFile: (name: string, content: string) => void;
  onPreviewUpdate?: (html: string) => void;
}

// Утилиты для работы с файловой структурой
const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

const getLanguageFromExtension = (ext: string): string => {
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    py: 'python',
    rb: 'ruby',
    php: 'php',
    go: 'go',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    swift: 'swift',
    rust: 'rust',
  };

  return languageMap[ext] || 'javascript';
};

// Определяем иконку для типа файла
const getFileIcon = (filename: string) => {
  const ext = getFileExtension(filename);

  switch (ext) {
    case 'html':
      return <FileCode className="h-4 w-4 text-orange-400" />;
    case 'css':
      return <FileCode className="h-4 w-4 text-blue-400" />;
    case 'js':
    case 'jsx':
      return <FileCode className="h-4 w-4 text-yellow-400" />;
    case 'ts':
    case 'tsx':
      return <FileCode className="h-4 w-4 text-blue-600" />;
    case 'json':
      return <FileCode className="h-4 w-4 text-yellow-500" />;
    case 'md':
      return <FileCode className="h-4 w-4 text-gray-400" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

export default function CodeEditor({
  code,
  updateCode,
  activeFile,
  setActiveFile,
  files,
  addFile,
  onPreviewUpdate
}: CodeEditorProps) {
  const { toast } = useToast();
  const editorRef = useRef<any>(null);

  // Состояние для древовидной структуры файлов
  const [fileTree, setFileTree] = useState<FileNode[]>([
    {
      id: 'root',
      name: 'project',
      type: 'folder',
      isExpanded: true,
      children: [
        {
          id: 'src',
          name: 'src',
          type: 'folder',
          isExpanded: true,
          parentId: 'root',
          children: [
            {
              id: 'index.html',
              name: 'index.html',
              type: 'file',
              parentId: 'src',
              language: 'html',
              content: '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>Мой проект</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <div id="app">\n    <h1>Привет, мир!</h1>\n  </div>\n  <script src="app.js"></script>\n</body>\n</html>'
            },
            {
              id: 'styles.css',
              name: 'styles.css',
              type: 'file',
              parentId: 'src',
              language: 'css',
              content: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background-color: #f5f5f5;\n}\n\n#app {\n  max-width: 800px;\n  margin: 0 auto;\n  background-color: white;\n  padding: 20px;\n  border-radius: 8px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}'
            },
            {
              id: 'app.js',
              name: 'app.js',
              type: 'file',
              parentId: 'src',
              language: 'javascript',
              content: '// Основной JavaScript код\nconsole.log("Приложение запущено!");\n\n// Пример простой функции\nfunction showMessage(message) {\n  const app = document.getElementById("app");\n  const messageElement = document.createElement("p");\n  messageElement.textContent = message;\n  app.appendChild(messageElement);\n}\n\n// Вызов функции при загрузке\ndocument.addEventListener("DOMContentLoaded", () => {\n  showMessage("Это сообщение добавлено с помощью JavaScript!");\n});'
            }
          ]
        },
        {
          id: 'package.json',
          name: 'package.json',
          type: 'file',
          parentId: 'root',
          language: 'json',
          content: '{\n  "name": "my-project",\n  "version": "1.0.0",\n  "description": "Мой проект созданный с AIWebCraft",\n  "main": "src/app.js",\n  "scripts": {\n    "start": "serve src"\n  },\n  "dependencies": {\n    "serve": "^14.0.0"\n  }\n}'
        }
      ]
    }
  ]);

  // Диалоговые окна
  const [showDependencyDialog, setShowDependencyDialog] = useState(false);
  const [dependencyName, setDependencyName] = useState('');
  const [dependencyType, setDependencyType] = useState('dependency');

  const [showGitHubDialog, setShowGitHubDialog] = useState(false);
  const [gitHubRepo, setGitHubRepo] = useState('');

  // Состояние для активной вкладки
  const [activeTabs, setActiveTabs] = useState<string[]>(['index.html']);
  const [currentTab, setCurrentTab] = useState('index.html');

  // Ссылка на WebSocket для коллаборативного редактирования
  const wsRef = useRef<WebSocket | null>(null);

  // Таймер для обновления предпросмотра
  const previewUpdateTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Инициализация WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      wsRef.current = socket;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'code-update' && data.fileId !== currentTab) {
          // Обновление кода от другого пользователя
          updateFileContent(data.fileId, data.content);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      wsRef.current = null;
    };

    return () => {
      socket.close();
    };
  }, []);

  // Отправка изменений через WebSocket
  const broadcastChanges = (fileId: string, content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'code-update',
        fileId,
        content
      }));
    }
  };

  // Функция для поиска файла в дереве
  const findFile = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children && node.children.length > 0) {
        const found = findFile(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Функция для обновления содержимого файла
  const updateFileContent = (fileId: string, content: string) => {
    setFileTree(prev => {
      const updateNodeContent = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.id === fileId) {
            return { ...node, content };
          }

          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: updateNodeContent(node.children)
            };
          }

          return node;
        });
      };

      return updateNodeContent(prev);
    });
  };

  // Обработчик события выбора файла
  const handleFileSelect = (fileId: string, fileName: string, language: string, content?: string) => {
    // Добавление или переключение на вкладку
    if (!activeTabs.includes(fileId)) {
      setActiveTabs([...activeTabs, fileId]);
    }
    setCurrentTab(fileId);

    // Обновление кода
    if (content !== undefined) {
      updateCode(content);
    } else {
      const file = findFile(fileTree, fileId);
      if (file && file.content) {
        updateCode(file.content);
      }
    }
  };

  // Функция добавления нового файла
  const handleAddNewFile = (parentId: string) => {
    const fileName = prompt("Введите имя файла:", "newfile.js");
    if (fileName) {
      const fileId = `${parentId}/${fileName}`;
      const ext = getFileExtension(fileName);
      const language = getLanguageFromExtension(ext);

      setFileTree(prev => {
        const updateNodes = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
            if (node.id === parentId) {
              return {
                ...node,
                isExpanded: true,
                children: [
                  ...(node.children || []),
                  {
                    id: fileId,
                    name: fileName,
                    type: 'file',
                    parentId,
                    language,
                    content: ''
                  }
                ]
              };
            }

            if (node.children && node.children.length > 0) {
              return {
                ...node,
                children: updateNodes(node.children)
              };
            }

            return node;
          });
        };

        return updateNodes(prev);
      });

      // Открыть новый файл
      handleFileSelect(fileId, fileName, language, '');
    }
  };

  // Функция добавления новой папки
  const handleAddNewFolder = (parentId: string) => {
    const folderName = prompt("Введите имя папки:", "new-folder");
    if (folderName) {
      const folderId = `${parentId}/${folderName}`;

      setFileTree(prev => {
        const updateNodes = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
            if (node.id === parentId) {
              return {
                ...node,
                isExpanded: true,
                children: [
                  ...(node.children || []),
                  {
                    id: folderId,
                    name: folderName,
                    type: 'folder',
                    parentId,
                    children: [],
                    isExpanded: true
                  }
                ]
              };
            }

            if (node.children && node.children.length > 0) {
              return {
                ...node,
                children: updateNodes(node.children)
              };
            }

            return node;
          });
        };

        return updateNodes(prev);
      });
    }
  };

  // Функция для удаления файла или папки
  const handleDeleteNode = (nodeId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
      // Удаляем из вкладок если файл открыт
      if (activeTabs.includes(nodeId)) {
        setActiveTabs(activeTabs.filter(tab => tab !== nodeId));
        if (currentTab === nodeId) {
          setCurrentTab(activeTabs[0] === nodeId ? activeTabs[1] || '' : activeTabs[0] || '');
        }
      }

      // Удаляем из дерева
      setFileTree(prev => {
        const removeNode = (nodes: FileNode[]): FileNode[] => {
          return nodes.filter(node => {
            if (node.id === nodeId) return false;

            if (node.children && node.children.length > 0) {
              node.children = removeNode(node.children);
            }

            return true;
          });
        };

        return removeNode(prev);
      });
    }
  };

  // Функция для переключения состояния раскрытия папки
  const toggleFolderExpand = (folderId: string) => {
    setFileTree(prev => {
      const toggleExpand = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.id === folderId) {
            return {
              ...node,
              isExpanded: !node.isExpanded
            };
          }

          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: toggleExpand(node.children)
            };
          }

          return node;
        });
      };

      return toggleExpand(prev);
    });
  };

  // Функция для закрытия вкладки
  const handleCloseTab = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newTabs = activeTabs.filter(tab => tab !== tabId);
    setActiveTabs(newTabs);

    if (currentTab === tabId) {
      // Переключаемся на другую вкладку если закрываем активную
      const currentIndex = activeTabs.indexOf(tabId);
      const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
      const nextTab = activeTabs[nextIndex] === tabId ? activeTabs[nextIndex + 1] : activeTabs[nextIndex];

      if (nextTab) {
        setCurrentTab(nextTab);
        const file = findFile(fileTree, nextTab);
        if (file && file.content) {
          updateCode(file.content);
        }
      } else {
        setCurrentTab('');
        updateCode('');
      }
    }
  };

  // Функция для отображения дерева файлов
  const renderFileTree = (nodes: FileNode[] = [], level = 0) => {
    return (
      <div className="pl-[10px]">
        {nodes.map((node) => (
          <div key={node.id}>
            <div 
              className={`flex items-center rounded-md gap-1 hover:bg-secondary ${
                currentTab === node.id ? 'bg-secondary/50 text-foreground' : 'text-muted-foreground'
              } py-1 group`}
            >
              {node.type === 'folder' && (
                <button 
                  className="w-4 h-4 flex items-center justify-center" 
                  onClick={() => toggleFolderExpand(node.id)}
                >
                  {node.isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )}

              {node.type === 'file' ? (
                <div className="flex-1 flex items-center gap-1 cursor-pointer pl-1" 
                  onClick={() => handleFileSelect(node.id, node.name, node.language || 'javascript', node.content)}
                >
                  {getFileIcon(node.name)}
                  <span className="text-xs truncate">{node.name}</span>

                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(node.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-1 cursor-pointer pl-1" 
                  onClick={() => toggleFolderExpand(node.id)}
                >
                  <Folder className="h-4 w-4 text-blue-300" />
                  <span className="text-xs font-medium">{node.name}</span>

                  <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-4 w-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddNewFile(node.id);
                      }}
                    >
                      <PlusCircle className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-4 w-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddNewFolder(node.id);
                      }}
                    >
                      <FolderPlus className="h-3 w-3" />
                    </Button>
                    {node.id !== 'root' && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-4 w-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {node.type === 'folder' && node.isExpanded && node.children && (
              <div className="border-l border-border ml-2">
                {renderFileTree(node.children, level + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    // Load custom theme
    loadMonacoTheme(editor);
  };

  const handleRunCode = async () => {
    try {
      // Сначала сохраняем текущие изменения в файле
      updateFileContent(currentTab, code);

      // Собираем HTML для предпросмотра
      // Если текущий файл HTML, просто используем его
      // Иначе ищем index.html и вставляем остальные файлы
      const currentFile = findFile(fileTree, currentTab);

      let html = "";
      let indexHtmlFile = null;

      if (currentFile?.name.endsWith('.html')) {
        html = code;
      } else {
        // Ищем index.html
        const findIndexHtml = (nodes: FileNode[]): FileNode | null => {
          for (const node of nodes) {
            if (node.type === 'file' && node.name === 'index.html') {
              return node;
            }
            if (node.children) {
              const found = findIndexHtml(node.children);
              if (found) return found;
            }
          }
          return null;
        };

        indexHtmlFile = findIndexHtml(fileTree);

        if (indexHtmlFile && indexHtmlFile.content) {
          html = indexHtmlFile.content;
        } else {
          // Если нет index.html, создаем базовый HTML для запуска текущего файла
          html = `
            <!DOCTYPE html>
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
              <div id="app"></div>
              ${currentFile?.name.endsWith('.js') ? `<script>${code}</script>` : ''}
              ${currentFile?.name.endsWith('.css') ? `<style>${code}</style>` : ''}
            </body>
            </html>
          `;
        }
      }

      // Отправка кода для запуска
      const result = await runCode(html);

      if (result.html && onPreviewUpdate) {
        onPreviewUpdate(result.html);
      }

      toast({
        title: "Код запущен",
        description: "Ваш код выполняется в панели предпросмотра.",
      });
    } catch (error) {
      toast({
        title: "Ошибка выполнения кода",
        description: error instanceof Error ? error.message : "Произошла неизвестная ошибка",
        variant: "destructive",
      });
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || "";
    updateCode(newValue);

    // Сохраняем изменения в текущем файле
    if (currentTab) {
      updateFileContent(currentTab, newValue);

      // Отправляем изменения через WebSocket
      broadcastChanges(currentTab, newValue);

      // Обновляем предпросмотр в реальном времени с небольшой задержкой
      // для предотвращения слишком частого обновления при быстром вводе
      if (previewUpdateTimeout.current) {
        clearTimeout(previewUpdateTimeout.current);
      }
      previewUpdateTimeout.current = setTimeout(() => {
        // Обновляем предпросмотр только для HTML, CSS и JS файлов
        const ext = getFileExtension(currentTab);
        if (['html', 'css', 'js', 'jsx'].includes(ext)) {
          handleRunCode();
        }
      }, 1000); // 1 секунда задержки
    }
  };

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      toast({
        title: "Скопировано в буфер обмена",
        description: "Код был скопирован в буфер обмена.",
      });
    }
  };

  const handleAddDependency = async () => {
    if (!dependencyName) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, укажите имя зависимости",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/install-dependency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dependency: dependencyName, type: dependencyType })
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Установлено",
          description: `Зависимость ${dependencyName} успешно установлена`,
        });

        // Обновляем package.json
        const packageFile = findFile(fileTree, 'package.json');
        if (packageFile && packageFile.content) {
          try {
            const packageJson = JSON.parse(packageFile.content);
            const section = dependencyType === 'dev' ? 'devDependencies' : 'dependencies';

            if (!packageJson[section]) {
              packageJson[section] = {};
            }

            packageJson[section][dependencyName] = "^latest";

            updateFileContent('package.json', JSON.stringify(packageJson, null, 2));
          } catch (e) {
            console.error("Error updating package.json:", e);
          }
        }

        // Закрыть диалог
        setShowDependencyDialog(false);
        setDependencyName('');
      } else {
        throw new Error(result.message || "Неизвестная ошибка");
      }
    } catch (error) {
      toast({
        title: "Ошибка установки",
        description: error instanceof Error ? error.message : "Произошла неизвестная ошибка",
        variant: "destructive",
      });
    }
  };

  const handleExportToGitHub = async () => {
    if (!gitHubRepo) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, укажите имя репозитория",
        variant: "destructive",
      });
      return;
    }

    try {
      // Собираем все файлы из дерева в плоский список
      const collectFiles = (nodes: FileNode[]): {name: string, content: string}[] => {
        let files: {name: string, content: string}[] = [];

        for (const node of nodes) {
          if (node.type === 'file' && node.content) {
            files.push({
              name: node.name,
              content: node.content
            });
          }

          if (node.children && node.children.length > 0) {
            files = [...files, ...collectFiles(node.children)];
          }
        }

        return files;
      };

      const files = collectFiles(fileTree);

      // Отправляем на сервер
      const response = await fetch("/api/export-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          repo: gitHubRepo,
          token: "GITHUB_TOKEN", // В реальном приложении брать из переменных окружения
          files
        })
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Экспорт выполнен",
          description: `Проект успешно экспортирован на GitHub: ${result.url}`,
        });

        // Закрыть диалог
        setShowGitHubDialog(false);
        setGitHubRepo('');
      } else {
        throw new Error(result.message || "Неизвестная ошибка");
      }
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: error instanceof Error ? error.message : "Произошла неизвестная ошибка",
        variant: "destructive",
      });
    }
  };

  // Определяем язык редактора по расширению файла
  const getEditorLanguage = () => {
    const currentFile = findFile(fileTree, currentTab);
    if (currentFile && currentFile.language) {
      return currentFile.language;
    }

    if (currentTab) {
      const ext = getFileExtension(currentTab);
      return getLanguageFromExtension(ext);
    }

    return 'javascript';
  };

  return (
    <Card className="flex flex-col h-full shadow-[0_0_15px_rgba(59,130,246,0.3)] relative overflow-hidden border-blue-500/30 before:absolute before:inset-0 before:-z-10 before:bg-[linear-gradient(rgba(59,130,246,0.1),rgba(139,92,246,0.1),rgba(59,130,246,0.1))] before:opacity-30 before:animate-[spin_6s_linear_infinite]">
      <CardHeader className="border-b border-border/40 px-4 py-3 space-y-0 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-base font-medium">Редактор кода</CardTitle>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={handleRunCode}
            className="h-8 text-xs bg-blue-500/20 text-blue-500 border border-blue-500/40 hover:bg-blue-500/30"
          >
            <Play className="h-3 w-3 mr-1" />
            Запуск
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
            <RefreshCcw className="h-3 w-3 mr-1" />
            Форматировать
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 text-xs"
            onClick={handleCopyCode}
          >
            <Clipboard className="h-3 w-3 mr-1" />
            Копировать
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 text-xs"
            onClick={() => setShowDependencyDialog(true)}
          >
            <Package className="h-3 w-3 mr-1" />
            Зависимости
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 text-xs"
            onClick={() => setShowGitHubDialog(true)}
          >
            <Github className="h-3 w-3 mr-1" />
            GitHub
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 text-xs"
            onClick={() => {
              // Logic for downloading project as ZIP
              toast({
                title: "Скачивание проекта",
                description: "Эта функция будет доступна в следующем обновлении",
              });
            }}
          >
            <Download className="h-3 w-3 mr-1" />
            Скачать
          </Button>
        </div>
      </CardHeader>

      <div className="flex h-[calc(100%-64px)]">
        {/* Боковая панель с древовидной структурой */}
        <div className="w-64 border-r border-border/40 flex flex-col p-2 overflow-auto h-full">
          <div className="text-xs font-medium mb-2 text-muted-foreground">Файлы проекта</div>
          {renderFileTree(fileTree)}
        </div>

        <div className="flex-1 flex flex-col">
          {/* Табы с файлами */}
          <div className="flex border-b border-border/40 overflow-x-auto">
            {activeTabs.map((tabId) => {
              const file = findFile(fileTree, tabId);
              return file ? (
                <Button
                  key={tabId}
                  variant="ghost"
                  className={`h-9 px-4 py-2 text-sm rounded-none flex items-center ${
                    tabId === currentTab 
                      ? 'border-b-2 border-blue-500 text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => {
                    setCurrentTab(tabId);
                    const fileNode = findFile(fileTree, tabId);
                    if (fileNode && fileNode.content) {
                      updateCode(fileNode.content);
                    }
                  }}
                >
                  {getFileIcon(file.name)}
                  <span className="ml-1 mr-2">{file.name}</span>
                  <button
                    className="h-4 w-4 flex items-center justify-center rounded-full hover:bg-background"
                    onClick={(e) => handleCloseTab(tabId, e)}
                  >
                    ×
                  </button>
                </Button>
              ) : null;
            })}
          </div>

          {/* Редактор кода */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={getEditorLanguage()}
              value={code}
              onChange={handleEditorChange}
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
          </div>
        </div>
      </div>

      {/* Диалог установки зависимостей */}
      {showDependencyDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Установка зависимостей</h3>
            <div className="mb-4">
              <label className="block text-sm mb-2">Имя пакета</label>
              <input 
                type="text" 
                value={dependencyName}
                onChange={(e) => setDependencyName(e.target.value)}
                className="w-full p-2 rounded border border-border bg-input"
                placeholder="например, react"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm mb-2">Тип зависимости</label>
              <select 
                value={dependencyType}
                onChange={(e) => setDependencyType(e.target.value)}
                className="w-full p-2 rounded border border-border bg-input"
              >
                <option value="dependency">Основная зависимость</option>
                <option value="dev">Зависимость для разработки</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDependencyDialog(false)}
              >
                Отмена
              </Button>
              <Button onClick={handleAddDependency}>
                Установить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Диалог экспорта на GitHub */}
      {showGitHubDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Экспорт на GitHub</h3>
            <div className="mb-6">
              <label className="block text-sm mb-2">Имя репозитория</label>
              <input 
                type="text" 
                value={gitHubRepo}
                onChange={(e) => setGitHubRepo(e.target.value)}
                className="w-full p-2 rounded border border-border bg-input"
                placeholder="username/repo"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowGitHubDialog(false)}
              >
                Отмена
              </Button>
              <Button onClick={handleExportToGitHub}>
                Экспортировать
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}