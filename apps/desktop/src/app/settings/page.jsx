'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('codeforge:openrouter_key') || '';
    setApiKey(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem('codeforge:openrouter_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-surface-0">
      <header className="h-10 bg-surface-1 border-b border-surface-4 flex items-center px-4 shrink-0">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <span className="ml-4 text-sm font-semibold text-white">Settings</span>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-xl space-y-8">
          {/* API Key */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">OpenRouter API Key</h2>
            <p className="text-sm text-slate-400 mb-4">
              Required for the AI agents. Get a key from{' '}
              <a href="https://openrouter.ai" target="_blank" className="text-forge-400 hover:underline" rel="noreferrer">
                openrouter.ai
              </a>
            </p>
            <div className="flex gap-3">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-..."
                className="flex-1 bg-surface-2 border border-surface-4 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-forge-500"
              />
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-forge-600 hover:bg-forge-700 text-white rounded-lg transition-colors"
              >
                {saved ? '✓ Saved' : 'Save'}
              </button>
            </div>
          </div>

          {/* Models */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Model Configuration</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between bg-surface-2 rounded-lg px-4 py-3">
                <span className="text-slate-300">Supervisor / Planner</span>
                <span className="text-forge-400">Nemotron 3 Ultra</span>
              </div>
              <div className="flex justify-between bg-surface-2 rounded-lg px-4 py-3">
                <span className="text-slate-300">Primary Coder</span>
                <span className="text-forge-400">Qwen3-Coder</span>
              </div>
              <div className="flex justify-between bg-surface-2 rounded-lg px-4 py-3">
                <span className="text-slate-300">Reviewer / Critic</span>
                <span className="text-forge-400">GPT-OSS 120B</span>
              </div>
              <div className="flex justify-between bg-surface-2 rounded-lg px-4 py-3">
                <span className="text-slate-300">Documentation</span>
                <span className="text-forge-400">Gemma 4 31B</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}