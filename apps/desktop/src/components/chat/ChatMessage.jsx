'use client';

import { useState } from 'react';

const roleStyles = {
  user: 'bg-forge-600/10 border-forge-600/20',
  supervisor: 'bg-yellow-500/10 border-yellow-500/20',
  coder: 'bg-blue-500/10 border-blue-500/20',
  reviewer: 'bg-purple-500/10 border-purple-500/20',
  docs: 'bg-green-500/10 border-green-500/20',
  system: 'bg-surface-2 border-surface-4',
};

const roleLabels = {
  user: 'You',
  supervisor: 'Nemotron (Supervisor)',
  coder: 'Qwen3 (Coder)',
  reviewer: 'GPT-OSS (Reviewer)',
  docs: 'Gemma (Docs)',
  system: 'System',
};

export function ChatMessage({ message }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className={`rounded-lg border p-3 ${roleStyles[message.role] || roleStyles.system}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-slate-300">
          {roleLabels[message.role] || message.role}
        </span>
        {message.status && (
          <span className={`text-xs ${
            message.status === 'success' ? 'text-emerald-400' :
            message.status === 'error' ? 'text-red-400' :
            message.status === 'running' ? 'text-yellow-400 animate-pulse' :
            'text-slate-500'
          }`}>
            {message.status === 'running' ? '⟳' : message.status === 'success' ? '✓' : message.status === 'error' ? '✗' : ''}
          </span>
        )}
        {message.actions && message.actions.length > 0 && (
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-xs text-slate-500 hover:text-slate-300 ml-auto"
          >
            {showActions ? 'Hide' : 'Show'} actions ({message.actions.length})
          </button>
        )}
      </div>

      {/* Content */}
      <div className="text-sm text-slate-200 whitespace-pre-wrap break-words">
        {message.content}
      </div>

      {/* Actions */}
      {showActions && message.actions && (
        <div className="mt-2 space-y-1">
          {message.actions.map((action, i) => (
            <div key={i} className="text-xs bg-surface-0 rounded px-2 py-1 font-mono text-slate-400">
              <span className="text-forge-400">[{action.type}]</span>{' '}
              {action.path || action.command || JSON.stringify(action)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}