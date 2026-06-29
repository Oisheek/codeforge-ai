'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/project.store';
import { useChatStore } from '@/store/chat.store';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { FileExplorer } from '@/components/explorer/FileExplorer';
import { TerminalPanel } from '@/components/terminal/TerminalPanel';
import { CodeEditor } from '@/components/editor/CodeEditor';

export default function ProjectPage() {
  const router = useRouter();
  const { currentProject, fileTree, loadFileTree } = useProjectStore();
  const [showTerminal, setShowTerminal] = useState(true);
  const [activeFile, setActiveFile] = useState(null);
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    if (!currentProject) {
      router.replace('/dashboard');
      return;
    }
    loadFileTree(currentProject.path);
  }, [currentProject, loadFileTree, router]);

  const handleFileSelect = async (filePath) => {
    try {
      const content = await window.codeforge.readFile(filePath);
      setActiveFile(filePath);
      setFileContent(content);
    } catch (err) {
      console.error('Failed to read file:', err);
    }
  };

  if (!currentProject) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-surface-0">
      {/* Top Bar */}
      <header className="h-10 bg-surface-1 border-b border-surface-4 flex items-center px-4 shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-forge-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span className="text-sm font-semibold text-white">CodeForge AI</span>
          <span className="text-xs text-slate-500 ml-2">—</span>
          <span className="text-xs text-slate-400 ml-2">{currentProject.name}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              showTerminal ? 'bg-surface-3 text-forge-300' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Terminal
          </button>
          <button
            onClick={() => {
              useProjectStore.getState().closeProject();
              router.push('/dashboard');
            }}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: File Explorer */}
        <aside className="w-60 bg-surface-1 border-r border-surface-4 overflow-y-auto shrink-0">
          <FileExplorer
            tree={fileTree}
            onFileSelect={handleFileSelect}
            activeFile={activeFile}
          />
        </aside>

        {/* Center: Chat + Editor + Terminal */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Chat + Editor area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Chat Panel */}
            <div className="flex-1 flex flex-col min-w-0">
              <ChatPanel />
            </div>

            {/* Editor Panel */}
            {activeFile && (
              <div className="w-[45%] border-l border-surface-4 shrink-0">
                <CodeEditor
                  filePath={activeFile}
                  content={fileContent}
                  onSave={async (newContent) => {
                    await window.codeforge.writeFile(activeFile, newContent);
                    setFileContent(newContent);
                  }}
                  onClose={() => setActiveFile(null)}
                />
              </div>
            )}
          </div>

          {/* Terminal */}
          {showTerminal && (
            <div className="h-48 border-t border-surface-4 shrink-0">
              <TerminalPanel projectPath={currentProject.path} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}