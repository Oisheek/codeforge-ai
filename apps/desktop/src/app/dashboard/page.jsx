'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/project.store';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { projects, currentProject, openProject, loadProjects } = useProjectStore();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleOpenFolder = async () => {
    setLoading(true);
    try {
      const folderPath = await window.codeforge.openFolder();
      if (folderPath) {
        await openProject(folderPath);
        router.push('/project');
      }
    } catch (err) {
      console.error('Failed to open folder:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRecent = async (projectPath) => {
    await openProject(projectPath);
    router.push('/project');
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-surface-0 p-8">
      <div className="w-full max-w-2xl">
        {/* Logo / Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-forge-600/20 border border-forge-600/30 mb-4">
            <svg className="w-8 h-8 text-forge-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CodeForge AI</h1>
          <p className="text-slate-400">Autonomous software engineering agent</p>
        </div>

        {/* Open Folder Button */}
        <button
          onClick={handleOpenFolder}
          disabled={loading}
          className="w-full py-4 px-6 bg-forge-600 hover:bg-forge-700 disabled:bg-forge-800 disabled:cursor-wait text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-3 text-lg mb-8"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          {loading ? 'Opening...' : 'Open Project Folder'}
        </button>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Recent Projects
            </h2>
            <div className="space-y-2">
              {projects.map((proj) => (
                <button
                  key={proj.path}
                  onClick={() => handleOpenRecent(proj.path)}
                  className="w-full text-left px-4 py-3 bg-surface-2 hover:bg-surface-3 border border-surface-4 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-forge-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <div>
                      <div className="text-white font-medium group-hover:text-forge-300 transition-colors">
                        {proj.name}
                      </div>
                      <div className="text-xs text-slate-500">{proj.path}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}