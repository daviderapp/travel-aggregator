'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Filter, Plane, SortAsc } from 'lucide-react'
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

  // Calcola notti per display
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const nights = checkIn && checkOut ? calculateNights(new Date(checkIn), new Date(checkOut)) : 1
  const destination = searchParams.get('destination')
  const guests = searchParams.get('guests') || '2'

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true)
        const queryString = searchParams.toString()
        const response = await fetch(`/api/search?${queryString}`)
        
        if (!response.ok) {
          throw new Error('Errore nella ricerca')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ricerca dei migliori pacchetti in corso...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops! Qualcosa è andato storto</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Torna alla Home
          </Link>
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
            <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <ArrowLeft className="w-5 h-5" />
              <span>Nuova Ricerca</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Plane className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">TravelAggregator</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intestazione Risultati */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pacchetti per {destination}
          </h1>
          <p className="text-gray-600">
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
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <div className="flex items-center mb-4">
                <Filter className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Filtri</h3>
              </div>

              {/* Ordinamento */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SortAsc className="inline w-4 h-4 mr-1" />
                  Ordina per
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="score">Migliore Match</option>
                  <option value="price">Prezzo (Basso → Alto)</option>
                  <option value="rating">Rating (Alto → Basso)</option>
                </select>
              </div>

              {/* Prezzo Massimo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prezzo max: {formatCurrency(maxPrice)}
                </label>
                <input
                  type="range"
                  min={results?.filters.priceRange.min || 200}
                  max={results?.filters.priceRange.max || 2000}
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Rating Minimo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating minimo: {minRating}/5
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Compagnie Aeree */}
              {results && results.filters.airlines.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        <span className="text-sm">{airline}</span>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nessun pacchetto trovato
                </h3>
                <p className="text-gray-600 mb-6">
                  Prova a modificare i filtri o le date di ricerca
                </p>
                <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
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