import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Controlla se l'utente ha già una preferenza salvata
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        relative inline-flex h-8 w-14 items-center justify-center rounded-full
        transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isDark 
          ? 'bg-blue-600 shadow-inner' 
          : 'bg-gray-200 shadow-inner'
        }
      `}
      aria-label={isDark ? 'Attiva modalità chiara' : 'Attiva modalità scura'}
    >
      {/* Track */}
      <div className="absolute inset-0 rounded-full">
        {/* Thumb */}
        <div
          className={`
            absolute top-1 h-6 w-6 rounded-full bg-white shadow-md
            transform transition-transform duration-300 ease-in-out
            flex items-center justify-center
            ${isDark ? 'translate-x-7' : 'translate-x-1'}
          `}
        >
          {isDark ? (
            <Moon className="h-3 w-3 text-blue-600" />
          ) : (
            <Sun className="h-3 w-3 text-yellow-500" />
          )}
        </div>
      </div>
    </button>
  );
}