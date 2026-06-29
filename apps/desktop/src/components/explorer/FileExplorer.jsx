'use client';

import { useState } from 'react';

export function FileExplorer({ tree, onFileSelect, activeFile }) {
  return (
    <div className="p-2">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
        Explorer
      </div>
      {tree.length === 0 ? (
        <div className="text-xs text-slate-600 px-2">No files loaded</div>
      ) : (
        <div className="space-y-0.5">
          {tree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              onFileSelect={onFileSelect}
              activeFile={activeFile}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileTreeNode({ node, onFileSelect, activeFile, depth }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const isDir = node.type === 'directory';
  const isActive = node.path === activeFile;

  const handleClick = () => {
    if (isDir) {
      setExpanded(!expanded);
    } else {
      onFileSelect(node.path);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full text-left px-2 py-0.5 text-xs rounded transition-colors flex items-center gap-1.5 ${
          isActive
            ? 'bg-forge-600/20 text-forge-300'
            : 'text-slate-400 hover:bg-surface-3 hover:text-slate-200'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isDir ? (
          <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <span className="w-3" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {isDir && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              onFileSelect={onFileSelect}
              activeFile={activeFile}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}