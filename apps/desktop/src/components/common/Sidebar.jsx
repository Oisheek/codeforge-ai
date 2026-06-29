'use client';

import { useRouter, usePathname } from 'next/navigation';

const navItems = [
  { icon: 'folder', label: 'Dashboard', path: '/dashboard' },
  { icon: 'code', label: 'Project', path: '/project' },
  { icon: 'settings', label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-12 bg-surface-1 border-r border-surface-4 flex flex-col items-center py-4 gap-4 shrink-0">
      {/* Logo */}
      <div className="w-8 h-8 rounded-lg bg-forge-600/20 flex items-center justify-center mb-4">
        <svg className="w-4 h-4 text-forge-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>

      {/* Nav Items */}
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => router.push(item.path)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            pathname === item.path
              ? 'bg-forge-600/20 text-forge-400'
              : 'text-slate-500 hover:bg-surface-3 hover:text-slate-300'
          }`}
          title={item.label}
        >
          {item.icon === 'folder' && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          )}
          {item.icon === 'code' && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          )}
          {item.icon === 'settings' && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      ))}
    </aside>
  );
} 