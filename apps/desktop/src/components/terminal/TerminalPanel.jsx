'use client';

import { useState, useRef, useEffect } from 'react';

export function TerminalPanel({ projectPath }) {
  const [output, setOutput] = useState([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const terminalRef = useRef(null);
  const outputEndRef = useRef(null);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !window.codeforge) return;

    const cmd = input.trim();
    setHistory((prev) => [...prev, cmd]);
    setHistoryIdx(-1);
    setInput('');

    setOutput((prev) => [...prev, { type: 'input', text: `$ ${cmd}` }]);

    try {
      const result = await window.codeforge.runCommand(cmd, projectPath, {
        timeout: 60000,
      });
      setOutput((prev) => [
        ...prev,
        { type: 'stdout', text: result.stdout || '' },
        ...(result.stderr ? [{ type: 'stderr', text: result.stderr }] : []),
      ]);
    } catch (err) {
      setOutput((prev) => [
        ...prev,
        { type: 'stderr', text: err.message || 'Command failed' },
      ]);
    }
  };;

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = Math.min(historyIdx + 1, history.length - 1);
      if (history[newIdx]) {
        setHistoryIdx(newIdx);
        setInput(history[history.length - 1 - newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(newIdx);
      setInput(newIdx === -1 ? '' : history[history.length - 1 - newIdx]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface-1" ref={terminalRef}>
      {/* Terminal Header */}
      <div className="h-7 bg-surface-2 border-b border-surface-4 flex items-center px-3 shrink-0">
        <span className="text-xs text-slate-400">Terminal</span>
        <button
          onClick={() => setOutput([])}
          className="ml-auto text-xs text-slate-500 hover:text-slate-300"
        >
          Clear
        </button>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
        {output.map((line, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap break-all ${
              line.type === 'input'
                ? 'text-green-400'
                : line.type === 'stderr'
                ? 'text-red-400'
                : 'text-slate-300'
            }`}
          >
            {line.text}
          </div>
        ))}
        <div ref={outputEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center border-t border-surface-4 px-3 shrink-0">
        <span className="text-green-400 text-xs font-mono mr-2">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-xs font-mono text-slate-200 focus:outline-none py-1.5"
          placeholder="Run a command..."
          autoFocus
        />
      </form>
    </div>
  );
}