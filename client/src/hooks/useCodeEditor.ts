import { useState, useCallback } from 'react';
import { FileTab } from '@/components/CodeEditor';

export function useCodeEditor() {
  const [files, setFiles] = useState<FileTab[]>([
    { name: 'index.js', content: '' }
  ]);
  const [activeFile, setActiveFile] = useState('index.js');
  
  const getFileContent = useCallback((filename: string) => {
    const file = files.find(f => f.name === filename);
    return file ? file.content : '';
  }, [files]);
  
  const updateCode = useCallback((newCode: string) => {
    setFiles(prev => 
      prev.map(file => 
        file.name === activeFile 
          ? { ...file, content: newCode } 
          : file
      )
    );
  }, [activeFile]);
  
  const addFile = useCallback((name: string, content: string = '') => {
    // Check if file already exists
    if (files.some(file => file.name === name)) {
      const baseName = name.includes('.') 
        ? name.substring(0, name.lastIndexOf('.'))
        : name;
      const extension = name.includes('.')
        ? name.substring(name.lastIndexOf('.'))
        : '';
      
      // Find a unique name
      let counter = 1;
      let newName = `${baseName} (${counter})${extension}`;
      while (files.some(file => file.name === newName)) {
        counter++;
        newName = `${baseName} (${counter})${extension}`;
      }
      
      name = newName;
    }
    
    setFiles(prev => [...prev, { name, content }]);
    return name;
  }, [files]);
  
  const deleteFile = useCallback((name: string) => {
    // Don't delete the last file
    if (files.length <= 1) return;
    
    setFiles(prev => prev.filter(file => file.name !== name));
    
    // If we're deleting the active file, switch to the first available
    if (activeFile === name) {
      const remainingFiles = files.filter(file => file.name !== name);
      if (remainingFiles.length > 0) {
        setActiveFile(remainingFiles[0].name);
      }
    }
  }, [files, activeFile]);
  
  return {
    files,
    activeFile,
    setActiveFile,
    code: getFileContent(activeFile),
    updateCode,
    addFile,
    deleteFile
  };
}
