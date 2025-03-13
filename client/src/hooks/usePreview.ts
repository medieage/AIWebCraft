import { useState, useEffect, useMemo } from 'react';

interface UsePreviewOptions {
  code: string;
}

export function usePreview({ code }: UsePreviewOptions) {
  const [previewHtml, setPreviewHtml] = useState('');
  
  // Generate HTML preview from the code
  const generatePreview = useMemo(() => {
    if (!code) return '';
    
    // Basic HTML template for the preview
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          ${code}
          
          // Attempt to render if there's a component exported
          try {
            const App = typeof App !== 'undefined' ? App : 
                     typeof default_1 !== 'undefined' ? default_1 : 
                     typeof exports !== 'undefined' && exports.default ? exports.default : null;
                     
            if (App) {
              ReactDOM.createRoot(document.getElementById('root')).render(<App />);
            }
          } catch (error) {
            document.getElementById('root').innerHTML = \`<div class="p-4 text-red-500"><p>Error rendering component:</p><pre>\${error.message}</pre></div>\`;
          }
        </script>
      </body>
      </html>
    `;
    
    return html;
  }, [code]);
  
  useEffect(() => {
    setPreviewHtml(generatePreview);
  }, [generatePreview]);
  
  return {
    previewHtml
  };
}
