import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden ${
          sidebarOpen ? 'block animate-fade-in' : 'hidden'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        <Sidebar />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex w-0 flex-1 flex-col overflow-hidden relative">
        {/* Mobile header */}
        <div className="relative z-10 flex h-16 flex-shrink-0 glass lg:hidden">
          <button
            className="border-r border-gray-200/50 px-4 text-slate-500 focus:outline-none lg:hidden hover:bg-white/50"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 items-center px-4">
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">MediGuide AI</span>
          </div>
        </div>

        {/* Main content - Floating Container */}
        <main className="relative z-0 flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl min-h-full flex flex-col">
            <div className="glass-card flex-1 rounded-3xl shadow-2xl shadow-primary-900/5 border border-white/80 relative animate-slide-up p-6 md:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
