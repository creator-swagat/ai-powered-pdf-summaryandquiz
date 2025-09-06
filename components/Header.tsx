
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.908l-9 5.25v9.332l9-5.25V7.908zM2.25 7.908v9.332l9 5.25v-9.332l-9-5.25z" />
            </svg>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              PDF Learning Assistant
            </h1>
          </div>
          <p className="hidden md:block text-slate-500 dark:text-slate-400">
            Learn smarter, not harder.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
