import { ReactNode } from "react";

interface ThreePanelLayoutProps {
  chatPanel: ReactNode;
  codePanel: ReactNode;
  previewPanel: ReactNode;
}

export function ThreePanelLayout({ chatPanel, codePanel, previewPanel }: ThreePanelLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col py-6 px-4 md:px-8 bg-gradient-to-br from-[#0a0a1a] to-[#1a1b4b]">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center animate-pulse mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 [text-shadow:0_0_10px_rgba(0,179,255,0.7),0_0_20px_rgba(159,0,255,0.5)]">
            AI Website Generator
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-400 to-purple-600 text-white rounded-md font-medium hover:opacity-90 transition-opacity">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 inline mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Help
          </button>
          <div className="flex items-center bg-gray-900 text-white px-3 py-1.5 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-blue-400 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
            <span className="text-sm">Dark Mode</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Chat */}
        <div className="lg:col-span-1 flex flex-col">{chatPanel}</div>

        {/* Middle Panel: Code Editor */}
        <div className="lg:col-span-1 flex flex-col">{codePanel}</div>

        {/* Right Panel: Preview */}
        <div className="lg:col-span-2 flex flex-col">{previewPanel}</div>
      </main>

      {/* Footer */}
      <footer className="mt-6 text-center text-sm text-gray-500">
        <p>AI Website Generator &copy; {new Date().getFullYear()} | Built with Next.js & React</p>
      </footer>

      {/* Star Background */}
      <StarBackground />
    </div>
  );
}

function StarBackground() {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]">
      {Array.from({ length: 150 }).map((_, i) => {
        const size = Math.random() * 2 + 1;
        const positionX = Math.random() * 100;
        const positionY = Math.random() * 100;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;

        return (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-50 animate-twinkle"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${positionX}%`,
              top: `${positionY}%`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}
