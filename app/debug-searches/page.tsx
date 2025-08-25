'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Database, Search, Copy } from 'lucide-react'

interface WorkingSearch {
  destination: {
    name: string
    searchKeyword: string
    country: string
    airportCode: string
  }
  availability: {
    flights: number
    accommodations: number
  }
  budgetSuggestions: {
    budget: number
    comfortable: number
    luxury: number
  }
  sampleSearchUrls: {
    budget: string
    comfortable: string
    luxury: string
  }
}

export default function DebugSearchesPage() {
  const [workingSearches, setWorkingSearches] = useState<WorkingSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkingSearches = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/working-searches')
        
        if (!response.ok) {
          throw new Error('Errore nel caricamento ricerche')
        }
        
        const data = await response.json()
        setWorkingSearches(data.searches || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkingSearches()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Potresti aggiungere un toast notification qui
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analisi database in corso...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Errore</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Database className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Debug Ricerche</h1>
            </Link>
            <div className="flex space-x-4">
              <Link href="/test" className="text-blue-600 hover:text-blue-700">
                Pagina Test
              </Link>
              <Link href="/" className="text-blue-600 hover:text-blue-700">
                ← Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">
            🔧 Ricerche Garantite per Funzionare
          </h2>
          <p className="text-yellow-700">
            Queste combinazioni sono basate sui dati REALI del tuo database. 
            Usa il <strong>searchKeyword</strong> (non il nome completo) nel form di ricerca.
          </p>
        </div>

        {workingSearches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nessun dato trovato
            </h3>
            <p className="text-gray-600">
              Assicurati che il database sia popolato con dati mock.
            </p>
            <div className="mt-6">
              <code className="bg-gray-200 px-3 py-1 rounded text-sm">
                npm run db:seed
              </code>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {workingSearches.map((search, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                {/* Header Destinazione */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {search.destination.name}
                    </h3>
                    <p className="text-gray-600">
                      Codice: {search.destination.airportCode} • 
                      Voli: {search.availability.flights} • 
                      Alloggi: {search.availability.accommodations}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Dati disponibili
                    </div>
                  </div>
                </div>

                {/* Keyword da usare */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-800 font-semibold">
                        🔑 Usa questa keyword nel form:
                      </p>
                      <code className="text-lg font-mono bg-green-100 px-2 py-1 rounded text-green-900">
                        {search.destination.searchKeyword}
                      </code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(search.destination.searchKeyword)}
                      className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Budget Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">💰 Budget</h4>
                    <p className="text-2xl font-bold text-gray-600">€{search.budgetSuggestions.budget}</p>
                    <p className="text-sm text-gray-500">Economico</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">🏨 Comfort</h4>
                    <p className="text-2xl font-bold text-blue-600">€{search.budgetSuggestions.comfortable}</p>
                    <p className="text-sm text-gray-500">Medio</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">💎 Luxury</h4>
                    <p className="text-2xl font-bold text-purple-600">€{search.budgetSuggestions.luxury}</p>
                    <p className="text-sm text-gray-500">Alto</p>
                  </div>
                </div>

                {/* Link di Test */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link 
                    href={search.sampleSearchUrls.budget}
                    className="flex items-center justify-center bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Testa Budget
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                  <Link 
                    href={search.sampleSearchUrls.comfortable}
                    className="flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Testa Comfort
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                  <Link 
                    href={search.sampleSearchUrls.luxury}
                    className="flex items-center justify-center bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Testa Luxury
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer con istruzioni */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-3">
            📝 Come usare questi dati:
          </h3>
          <ol className="text-blue-700 space-y-2 list-decimal list-inside">
            <li>Vai alla <Link href="/" className="underline">homepage</Link></li>
            <li>Nel campo "Destinazione" seleziona usando la <strong>searchKeyword</strong></li>
            <li>Usa uno dei budget suggeriti sopra</li>
            <li>Oppure clicca direttamente sui link "Testa" qui sopra</li>
          </ol>
        </div>
      </div>
    </div>
  )
}