export function loadMonacoTheme(editor: any) {
  const monaco = (window as any).monaco;
  
  if (!monaco) return;
  
  // Define a futuristic theme with neon colors
  monaco.editor.defineTheme('futuristic-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272a4' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'keyword', foreground: 'ff79c6' },
      { token: 'number', foreground: 'bd93f9' },
      { token: 'operator', foreground: 'ff79c6' },
      { token: 'function', foreground: '50fa7b' },
      { token: 'variable', foreground: '8be9fd' },
      { token: 'variable.parameter', foreground: 'ffb86c' },
      { token: 'type', foreground: '8be9fd' },
      { token: 'class', foreground: '8be9fd' },
      { token: 'interface', foreground: '8be9fd' },
      { token: 'enum', foreground: '8be9fd' }
    ],
    colors: {
      'editor.background': '#1e1e2e',
      'editor.foreground': '#f8f8f2',
      'editorCursor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#2c2c4a',
      'editorLineNumber.foreground': '#6272a4',
      'editor.selectionBackground': '#44475a',
      'editor.wordHighlightBackground': '#6272a4',
      'editorBracketMatch.background': '#44475a',
      'editorBracketMatch.border': '#8be9fd'
    }
  });
  
  // Apply the theme
  monaco.editor.setTheme('futuristic-dark');
}
