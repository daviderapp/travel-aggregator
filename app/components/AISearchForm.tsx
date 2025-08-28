'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Send, Lightbulb } from 'lucide-react'

const exampleQueries = [
  "Un weekend romantico a Parigi sotto i 600€",
  "Vacanza rilassante con spa e piscina in Spagna",
  "Viaggio culturale di 5 giorni tra musei e arte",
  "Avventura economica per giovani ad Amsterdam"
]

export default function AISearchForm() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    setIsLoading(true)
    
    // Naviga alla pagina di ricerca AI con la query
    const searchParams = new URLSearchParams({
      mode: 'ai',
      query: query.trim()
    })
    
    router.push(`/search?${searchParams.toString()}`)
  }

  const handleExampleClick = (example: string) => {
    setQuery(example)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-purple-900/20 dark:via-gray-800 dark:to-indigo-900/20 rounded-xl shadow-lg p-8 border border-purple-100 dark:border-purple-800/30">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ricerca Intelligente AI
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Descrivi il tuo viaggio ideale in linguaggio naturale
          </p>
        </div>
        
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Esempio: Cerco un weekend romantico a Parigi con hotel di charme, budget 800€, voglio visitare musei e cenare in ristoranti tipici..."
              className="w-full p-4 pr-16 border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-32 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              required
            />
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute bottom-3 right-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors flex items-center justify-center group"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
          </div>
          
          {/* Character count */}
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Sii più descrittivo possibile per risultati migliori
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {query.length}/500
            </span>
          </div>
        </form>

        {/* Example Queries */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span>Prova questi esempi:</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-left p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-sm group"
              >
                <div className="flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                    {example}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Features */}
        <div className="mt-8 pt-6 border-t border-purple-100 dark:border-purple-800/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">Comprensione Naturale</div>
                <div className="text-gray-600 dark:text-gray-400">Parla come faresti con un amico</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">Suggerimenti Intelligenti</div>
                <div className="text-gray-600 dark:text-gray-400">Scopri opzioni che non avevi considerato</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">Risultati Personalizzati</div>
                <div className="text-gray-600 dark:text-gray-400">Basati sulle tue esigenze specifiche</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}