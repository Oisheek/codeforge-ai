import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  messages: [],
  agentStatus: 'idle', // idle | planning | coding | executing | reviewing | documenting | success | failed
  currentTask: null,
  isRunning: false,

  addMessage: (message) => {
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Date.now() + Math.random(),
          timestamp: Date.now(),
          ...message,
        },
      ],
    }));
  },

  updateLastMessage: (role, updates) => {
    set((state) => {
      const idx = [...state.messages].reverse().findIndex((m) => m.role === role);
      if (idx === -1) return state;
      const realIdx = state.messages.length - 1 - idx;
      const updated = [...state.messages];
      updated[realIdx] = { ...updated[realIdx], ...updates };
      return { messages: updated };
    });
  },

  setAgentStatus: (status) => set({ agentStatus: status }),
  setCurrentTask: (task) => set({ currentTask: task }),
  setIsRunning: (isRunning) => set({ isRunning }),

  clearMessages: () => set({ messages: [], agentStatus: 'idle', currentTask: null }),

  startTask: async (task, projectPath) => {
    const { addMessage, setAgentStatus, setCurrentTask, setIsRunning } = get();

    addMessage({ role: 'user', content: task });
    addMessage({ role: 'system', content: 'Starting agent...', status: 'running' });

    setCurrentTask(task);
    setIsRunning(true);
    setAgentStatus('planning');

    try {
      await window.codeforge.startAgent(task, projectPath, {});
    } catch (err) {
      addMessage({ role: 'system', content: `Error: ${err.message}`, status: 'error' });
      setAgentStatus('failed');
      setIsRunning(false);
    }
  },

  stopTask: async () => {
    try {
      await window.codeforge.stopAgent();
    } catch (err) {
      console.error('Failed to stop agent:', err);
    }
    set({ isRunning: false, agentStatus: 'idle' });
  },
}));