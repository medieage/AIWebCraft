import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Maximize, Download } from "lucide-react";

interface PreviewPanelProps {
  html: string;
  isLoading?: boolean;
}

export function PreviewPanel({ html, isLoading = false }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
      }
    }
  }, [html]);

  const toggleViewMode = () => {
    setViewMode(viewMode === "desktop" ? "mobile" : "desktop");
  };

  const exportHtml = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="flex-1 flex flex-col overflow-hidden glassmorphism bg-[#121212] bg-opacity-50 backdrop-blur-xl border-[1px] border-[rgba(255,255,255,0.1)] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative">
      <div className="absolute top-0 left-0 right-0 bottom-0 border-[1px] border-transparent pointer-events-none z-10" 
           style={{ borderImage: "linear-gradient(135deg, #00b3ff, #9f00ff) 1" }} />
      
      <CardHeader className="p-4 border-b border-gray-800 flex justify-between items-center">
        <CardTitle className="text-lg flex items-center text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Live Preview
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="bg-blue-700 bg-opacity-30 text-white text-xs px-2 py-1 h-8 flex items-center"
            onClick={toggleViewMode}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
            {viewMode === "desktop" ? "Desktop" : "Mobile"}
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white transition-colors p-0 h-8 w-8">
            <Maximize className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden bg-white relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="loader w-16 h-16 border-t-4 border-blue-400 border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className={`w-full h-full border-0 transition-all duration-300 ${
              viewMode === "mobile" ? "max-w-[375px] mx-auto" : ""
            }`}
            title="Website Preview"
            sandbox="allow-same-origin allow-scripts"
          />
        )}
      </CardContent>

      <CardFooter className="p-3 border-t border-gray-800 flex justify-between items-center">
        <div>
          <span className="text-xs text-gray-400">Preview Mode: {viewMode === "desktop" ? "Desktop" : "Mobile"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="p-1.5 h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="p-1.5 h-8 w-8" onClick={toggleViewMode}>
            <Maximize className="h-4 w-4" />
          </Button>
          <Button 
            className="bg-blue-600 text-white text-sm hover:bg-blue-500 px-3 py-1.5 h-8 flex items-center"
            onClick={exportHtml}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
