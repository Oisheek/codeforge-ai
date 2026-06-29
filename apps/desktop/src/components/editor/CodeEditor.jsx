import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

loader.config({ monaco });
const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((mod) => mod.default), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-slate-500 text-sm">Loading editor...</div>,
});

function getLanguage(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  const map = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
    html: 'html', css: 'css', scss: 'scss', json: 'json', yaml: 'yaml',
    yml: 'yaml', md: 'markdown', xml: 'xml', sql: 'sql', sh: 'shell',
    bash: 'shell', dockerfile: 'dockerfile', gitignore: 'plaintext',
  };
  return map[ext] || 'plaintext';
}

export function CodeEditor({ filePath, content, onSave, onClose }) {
  const [localContent, setLocalContent] = useState(content);
  const [modified, setModified] = useState(false);

  useEffect(() => {
    setLocalContent(content);
    setModified(false);
  }, [content, filePath]);

  const handleChange = (value) => {
    setLocalContent(value || '');
    setModified(value !== content);
  };

  const handleSave = () => {
    onSave(localContent);
    setModified(false);
  };

  const fileName = filePath.split(/[/\\]/).pop();

  return (
    <div className="h-full flex flex-col">
      {/* Tab */}
      <div className="h-9 bg-surface-2 border-b border-surface-4 flex items-center px-3 shrink-0">
        <span className="text-xs text-slate-300">
          {fileName}
          {modified && <span className="text-orange-400 ml-1">●</span>}
        </span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleSave}
            disabled={!modified}
            className="text-xs px-2 py-0.5 bg-forge-600/30 text-forge-300 rounded hover:bg-forge-600/50 disabled:opacity-30 transition-colors"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <MonacoEditor
  height="100%"
  language={getLanguage(filePath)}
  value={localContent}
  onChange={handleChange}
  onMount={(editor, monaco) => {
    console.log("✅ Monaco mounted");
    console.log(editor);
  }}
  onValidate={(markers) => {
    console.log("Markers:", markers);
  }}
/>
      </div>
    </div>
  );
}