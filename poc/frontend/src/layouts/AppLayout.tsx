import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-50/40">
      {/* Mobile overlay - shown when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar: controlled by state on mobile, always visible on desktop via CSS */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
          aria-label="Open menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="ml-4 flex items-center">
          <img
            src="/sta-ana-logo.png"
            alt="Barangay Sta Ana"
            className="h-8 w-auto object-contain"
          />
        </div>
      </header>
      <main className="min-h-screen p-4 pt-20 lg:ml-60 lg:p-8 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
