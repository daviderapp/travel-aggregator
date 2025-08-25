'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Users, Euro } from 'lucide-react'
import { SearchFormData, UserPreferences, AccommodationType } from '@/lib/types'

const destinations = [
  { value: 'parigi', label: 'Parigi, Francia' },
  { value: 'barcellona', label: 'Barcellona, Spagna' },
  { value: 'amsterdam', label: 'Amsterdam, Olanda' },
  { value: 'berlino', label: 'Berlino, Germania' },
  { value: 'praga', label: 'Praga, Repubblica Ceca' }
]

const accommodationTypes = [
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'HOSTEL', label: 'Ostello' },
  { value: 'APARTMENT', label: 'Appartamento' },
  { value: 'BNB', label: 'B&B' },
  { value: 'RESORT', label: 'Resort' }
]

const amenities = [
  'WiFi Gratuito', 'Piscina', 'Palestra', 'Spa', 'Ristorante',
  'Bar', 'Parcheggio', 'Animali Ammessi', 'Aria Condizionata', 'Colazione Inclusa'
]

export default function SearchForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState<SearchFormData>({
    destination: '',
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 86400000 * 3), // +3 giorni
    guests: 2,
    budget: 800,
    preferences: {
      accommodationType: ['HOTEL'],
      priceRange: 'mid',
      amenities: ['WiFi Gratuito'],
      flightPreference: 'best_time'
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Costruisci URL con parametri di ricerca
    const searchParams = new URLSearchParams({
      destination: formData.destination,
      checkIn: formData.checkIn.toISOString().split('T')[0],
      checkOut: formData.checkOut.toISOString().split('T')[0],
      guests: formData.guests.toString(),
      budget: formData.budget.toString(),
      preferences: JSON.stringify(formData.preferences)
    })
    
    router.push(`/search?${searchParams.toString()}`)
  }

  const updatePreferences = (key: keyof UserPreferences, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Trova il tuo pacchetto viaggio perfetto
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destinazione */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Destinazione
              </label>
              <select
                value={formData.destination}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleziona destinazione...</option>
                {destinations.map(dest => (
                  <option key={dest.value} value={dest.value}>
                    {dest.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ospiti */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                Ospiti
              </label>
              <select
                value={formData.guests}
                onChange={(e) => setFormData(prev => ({ ...prev, guests: Number(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1,2,3,4,5,6,7,8].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'persona' : 'persone'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Check-in
              </label>
              <input
                type="date"
                value={formData.checkIn.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, checkIn: new Date(e.target.value) }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Check-out
              </label>
              <input
                type="date"
                value={formData.checkOut.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, checkOut: new Date(e.target.value) }))}
                min={formData.checkIn.toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Euro className="inline w-4 h-4 mr-1" />
              Budget massimo: €{formData.budget}
            </label>
            <input
              type="range"
              min="200"
              max="2000"
              step="50"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>€200</span>
              <span>€2000</span>
            </div>
          </div>

          {/* Preferenze */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preferenze</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo Alloggio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo di alloggio
                </label>
                <div className="space-y-2">
                  {accommodationTypes.map(type => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences.accommodationType.includes(type.value as AccommodationType)}
                        onChange={(e) => {
                          const current = formData.preferences.accommodationType
                          const updated = e.target.checked
                            ? [...current, type.value as AccommodationType]
                            : current.filter(t => t !== type.value)
                          updatePreferences('accommodationType', updated)
                        }}
                        className="mr-2 rounded"
                      />
                      <span className="text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fascia Prezzo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fascia di prezzo
                </label>
                <select
                  value={formData.preferences.priceRange}
                  onChange={(e) => updatePreferences('priceRange', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="budget">Budget (Economico)</option>
                  <option value="mid">Medio</option>
                  <option value="luxury">Lusso</option>
                </select>
              </div>
            </div>

            {/* Servizi */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servizi desiderati
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {amenities.map(amenity => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferences.amenities.includes(amenity)}
                      onChange={(e) => {
                        const current = formData.preferences.amenities
                        const updated = e.target.checked
                          ? [...current, amenity]
                          : current.filter(a => a !== amenity)
                        updatePreferences('amenities', updated)
                      }}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferenza Volo */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferenza volo
              </label>
              <select
                value={formData.preferences.flightPreference}
                onChange={(e) => updatePreferences('flightPreference', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cheapest">Più economico</option>
                <option value="shortest">Più breve</option>
                <option value="best_time">Orari migliori</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formData.destination}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Ricerca in corso...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Cerca Pacchetti
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}