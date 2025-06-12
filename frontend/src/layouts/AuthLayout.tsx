import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-10 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-[#0D1C17] rounded-sm"></div>
          <span className="text-lg font-bold text-[#0D1C17] font-inter">
            Thelarte
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
