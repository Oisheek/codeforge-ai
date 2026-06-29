'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chat.store';
import { useProjectStore } from '@/store/project.store';
import { ChatMessage } from './ChatMessage';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { messages, agentStatus, isRunning, startTask, stopTask } = useChatStore();
  const { currentProject } = useProjectStore();

  // Listen for agent updates from main process
  useEffect(() => {
    const handleUpdate = (data) => {
      const { addMessage, setAgentStatus } = useChatStore.getState();
      if (data.type === 'status') {
        setAgentStatus(data.status);
        addMessage({ role: 'system', content: data.message, status: data.status });
      } else if (data.type === 'agent_message') {
        addMessage({ role: data.agent, content: data.content, actions: data.actions });
      } else if (data.type === 'action_result') {
        addMessage({ role: 'system', content: data.content, meta: data.meta });
      } else if (data.type === 'error') {
        addMessage({ role: 'system', content: `Error: ${data.message}`, status: 'error' });
        setAgentStatus('failed');
        useChatStore.setState({ isRunning: false });
      }
    };

    const handleComplete = (data) => {
      const { addMessage, setAgentStatus } = useChatStore.getState();
      if (data.success) {
        addMessage({ role: 'system', content: '✓ Task completed successfully.', status: 'success' });
        setAgentStatus('success');
      } else {
        addMessage({ role: 'system', content: `✗ Task failed: ${data.reason}`, status: 'error' });
        setAgentStatus('failed');
      }
      useChatStore.setState({ isRunning: false });
    };

    window.codeforge.onAgentUpdate(handleUpdate);
    window.codeforge.onAgentComplete(handleComplete);

    return () => {
    window.codeforge.removeAgentListeners();
};
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isRunning || !currentProject) return;
    startTask(input.trim(), currentProject.path);
    setInput('');
  };

  const statusColors = {
    idle: 'text-slate-500',
    planning: 'text-yellow-400',
    coding: 'text-blue-400',
    executing: 'text-orange-400',
    reviewing: 'text-purple-400',
    documenting: 'text-green-400',
    success: 'text-emerald-400',
    failed: 'text-red-400',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="h-9 bg-surface-1 border-b border-surface-4 flex items-center px-4 shrink-0">
        <span className={`text-xs font-medium uppercase tracking-wider ${statusColors[agentStatus]}`}>
          {agentStatus}
        </span>
        {isRunning && (
          <button
            onClick={stopTask}
            className="ml-auto text-xs px-2 py-0.5 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
          >
            Stop
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-20">
            <p className="text-lg mb-2">Ready to code</p>
            <p className="text-sm">Describe a task and the agent will work autonomously.</p>
            <div className="mt-6 space-y-2 text-sm">
              <p className="text-slate-600">Try:</p>
              <p className="italic text-slate-500">"Fix all TypeScript errors"</p>
              <p className="italic text-slate-500">"Add JWT authentication to the API"</p>
              <p className="italic text-slate-500">"Run tests and fix failures"</p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-surface-4 p-4 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRunning ? 'Agent is working...' : 'Describe a task...'}
            disabled={isRunning}
            className="flex-1 bg-surface-2 border border-surface-4 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-forge-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isRunning || !input.trim()}
            className="px-5 py-2.5 bg-forge-600 hover:bg-forge-700 disabled:bg-forge-800/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            Run
          </button>
        </form>
      </div>
    </div>
  );
}