import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Menu, Grid2X2, Grid3X3, Maximize2 } from "lucide-react";

interface PreviewPanelProps {
  html: string;
}

type ViewportSize = "desktop" | "tablet" | "mobile";

export default function PreviewPanel({ html }: PreviewPanelProps) {
  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");
  const [viewMode, setViewMode] = useState<string>("default");
  
  const getViewportClass = () => {
    switch (viewportSize) {
      case "mobile":
        return "w-[375px] h-full mx-auto";
      case "tablet":
        return "w-[768px] h-full mx-auto";
      default:
        return "w-full h-full";
    }
  };
  
  return (
    <Card className="flex flex-col h-full shadow-[0_0_15px_rgba(99,102,241,0.3)] relative overflow-hidden border-indigo-500/30 before:absolute before:inset-0 before:-z-10 before:bg-[linear-gradient(rgba(59,130,246,0.1),rgba(139,92,246,0.1),rgba(59,130,246,0.1))] before:opacity-30 before:animate-[spin_6s_linear_infinite]">
      <CardHeader className="border-b border-border/40 px-4 py-3 space-y-0 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-white" />
          <CardTitle className="text-base font-medium">Preview</CardTitle>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-none ${viewMode === 'default' ? 'bg-muted' : ''}`}
              onClick={() => setViewMode('default')}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-none ${viewMode === 'columns' ? 'bg-muted' : ''}`}
              onClick={() => setViewMode('columns')}
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-none ${viewMode === 'grid' ? 'bg-muted' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
          
          <Select 
            value={viewportSize} 
            onValueChange={(value: string) => setViewportSize(value as ViewportSize)}
          >
            <SelectTrigger className="h-7 w-[110px] text-xs bg-muted border-border">
              <SelectValue placeholder="Viewport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desktop">Desktop</SelectItem>
              <SelectItem value="tablet">Tablet</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="ghost" size="icon" className="h-7 w-7 bg-muted hover:bg-secondary rounded-md">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-auto bg-white">
        <div className={getViewportClass()}>
          {html ? (
            <iframe
              title="Preview"
              srcDoc={html}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2">Generate code to see preview</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
