'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Filter, Plane, SortAsc, Sparkles } from 'lucide-react'
import PackageCard from '../components/PackageCard'
import { SearchResponse, TravelPackage } from '@/lib/types'
import { calculateNights, formatCurrency } from '@/lib/utils'

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [filteredPackages, setFilteredPackages] = useState<TravelPackage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtri
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'rating'>('score')
  const [maxPrice, setMaxPrice] = useState<number>(2000)
  const [minRating, setMinRating] = useState<number>(0)
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])

  // Gestisce parametri per entrambe le modalità
  const mode = searchParams.get('mode') || 'classic'
  const originalQuery = searchParams.get('query') // Solo per ricerche AI
  const destination = searchParams.get('destination') || ''
  const guests = searchParams.get('guests') || '2'

  // Per le notti, usa i dati dai risultati se disponibili (per AI) o calcola dai parametri URL
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  
  const nights = results?.packages[0]?.accommodation?.totalNights || 
    (checkIn && checkOut ? calculateNights(new Date(checkIn), new Date(checkOut)) : 1)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true)
        const queryString = searchParams.toString()
        const response = await fetch(`/api/search?${queryString}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Errore nella ricerca')
        }
        
        const data: SearchResponse = await response.json()
        setResults(data)
        setFilteredPackages(data.packages)
        
        // Imposta filtri iniziali basati sui risultati
        if (data.filters.priceRange.max > 0) {
          setMaxPrice(data.filters.priceRange.max)
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [searchParams])

  // Applica filtri e ordinamento
  useEffect(() => {
    if (!results) return

    let filtered = results.packages.filter(pkg => {
      const priceMatch = pkg.totalPrice <= maxPrice
      const ratingMatch = pkg.accommodation.rating >= minRating
      const airlineMatch = selectedAirlines.length === 0 || 
                          selectedAirlines.includes(pkg.flight.airline)
      
      return priceMatch && ratingMatch && airlineMatch
    })

    // Ordinamento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.totalPrice - b.totalPrice
        case 'rating':
          return b.accommodation.rating - a.accommodation.rating
        case 'score':
        default:
          return b.score - a.score
      }
    })

    setFilteredPackages(filtered)
  }, [results, sortBy, maxPrice, minRating, selectedAirlines])

  const toggleAirline = (airline: string) => {
    setSelectedAirlines(prev => 
      prev.includes(airline)
        ? prev.filter(a => a !== airline)
        : [...prev, airline]
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {mode === 'ai' ? 'Analisi AI in corso...' : 'Ricerca dei migliori pacchetti in corso...'}
          </p>
          {mode === 'ai' && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Stiamo interpretando la tua richiesta e trovando le migliori opzioni
            </p>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ops! Qualcosa è andato storto</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Torna alla Home
          </Link>
        </div>
      </div>
    )
  }

  // Estrae la destinazione dai risultati se non presente nei parametri (per ricerche AI)
  const displayDestination = destination || results?.packages[0]?.flight?.destination || 'destinazione selezionata'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Nuova Ricerca</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Plane className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">TravelAggregator</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intestazione Risultati */}
        <div className="mb-8">
          {/* Badge per ricerca AI */}
          {mode === 'ai' && originalQuery && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">
                    Ricerca AI interpretata:
                  </h3>
                  <p className="text-sm text-purple-800 dark:text-purple-200 italic">
                    "{originalQuery}"
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                    Ho analizzato la tua richiesta e trovato i pacchetti che meglio corrispondono alle tue esigenze.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {mode === 'ai' ? 'Risultati AI per' : 'Pacchetti per'} {displayDestination}
            </h1>
            {mode === 'ai' && (
              <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                AI
              </div>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-300">
            {filteredPackages.length} pacchetti trovati per {guests} {guests === '1' ? 'persona' : 'persone'} 
            • {nights} {nights === 1 ? 'notte' : 'notti'}
            {results && (
              <span className="ml-2 text-sm">
                (ricerca completata in {results.searchTime}ms)
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filtri */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-4 transition-colors">
              <div className="flex items-center mb-4">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Filtri</h3>
              </div>

              {/* Ordinamento */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <SortAsc className="inline w-4 h-4 mr-1" />
                  Ordina per
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white transition-colors"
                >
                  <option value="score">{mode === 'ai' ? 'Migliore Match AI' : 'Migliore Match'}</option>
                  <option value="price">Prezzo (Basso → Alto)</option>
                  <option value="rating">Rating (Alto → Basso)</option>
                </select>
              </div>

              {/* Prezzo Massimo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prezzo max: {formatCurrency(maxPrice)}
                </label>
                <input
                  type="range"
                  min={results?.filters.priceRange.min || 200}
                  max={results?.filters.priceRange.max || 2000}
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer transition-colors"
                />
              </div>

              {/* Rating Minimo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating minimo: {minRating}/5
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer transition-colors"
                />
              </div>

              {/* Compagnie Aeree */}
              {results && results.filters.airlines.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Compagnie aeree
                  </label>
                  <div className="space-y-2">
                    {results.filters.airlines.map(airline => (
                      <label key={airline} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAirlines.includes(airline)}
                          onChange={() => toggleAirline(airline)}
                          className="mr-2 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{airline}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lista Risultati */}
          <div className="flex-1">
            {filteredPackages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Nessun pacchetto trovato
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {mode === 'ai' 
                    ? 'Prova a riformulare la tua richiesta o modificare i filtri'
                    : 'Prova a modificare i filtri o le date di ricerca'
                  }
                </p>
                <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Nuova Ricerca
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPackages.map((pkg) => (
                  <PackageCard 
                    key={pkg.id} 
                    package={pkg} 
                    nights={nights}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}