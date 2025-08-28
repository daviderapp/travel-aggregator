'use client'

import React, { useState } from 'react';
import { Filter, Sparkles } from 'lucide-react';

interface SearchModeToggleProps {
  mode: 'classic' | 'ai';
  onModeChange: (mode: 'classic' | 'ai') => void;
}

export default function SearchModeToggle({ mode, onModeChange }: SearchModeToggleProps) {
  return (
    <div className="flex flex-col items-center mb-8">
      {/* Etichette sopra il toggle */}
      <div className="flex justify-center items-center space-x-12 mb-4">
        <div className={`flex items-center space-x-2 transition-colors ${mode === 'classic' ? 'text-blue-600' : 'text-gray-500'}`}>
          <Filter className="w-5 h-5" />
          <span className="font-medium">Ricerca Classica</span>
        </div>
        <div className={`flex items-center space-x-2 transition-colors ${mode === 'ai' ? 'text-purple-600' : 'text-gray-500'}`}>
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">Ricerca AI</span>
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="relative">
        <button
          onClick={() => onModeChange(mode === 'classic' ? 'ai' : 'classic')}
          className={`
            relative inline-flex h-12 w-24 items-center justify-center rounded-full
            transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-25
            ${mode === 'classic' 
              ? 'bg-blue-100 focus:ring-blue-200' 
              : 'bg-purple-100 focus:ring-purple-200'
            }
          `}
          aria-label={`Cambia a ricerca ${mode === 'classic' ? 'AI' : 'classica'}`}
        >
          {/* Track background */}
          <div className="absolute inset-1 rounded-full bg-white shadow-inner"></div>
          
          {/* Sliding thumb */}
          <div
            className={`
              absolute h-10 w-10 rounded-full shadow-lg
              transform transition-all duration-300 ease-in-out
              flex items-center justify-center text-white font-bold text-sm
              ${mode === 'classic' 
                ? 'translate-x-[-6px] bg-blue-500' 
                : 'translate-x-[6px] bg-purple-500'
              }
            `}
          >
            {mode === 'classic' ? (
              <Filter className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </div>
        </button>
      </div>

      {/* Descrizione sotto il toggle */}
      <div className="mt-4 text-center max-w-md">
        {mode === 'classic' ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Usa filtri dettagliati per trovare il pacchetto perfetto
          </p>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Descrivi il tuo viaggio ideale e lascia che l'AI trovi le migliori opzioni
          </p>
        )}
      </div>
    </div>
  );
}