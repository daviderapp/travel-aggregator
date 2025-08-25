'use client'

import { TravelPackage } from '@/lib/types'
import { formatCurrency, formatTime, formatDuration } from '@/lib/utils'
import { Plane, MapPin, Star, Clock, Users, Wifi } from 'lucide-react'

interface PackageCardProps {
  package: TravelPackage
  nights: number
}

export default function PackageCard({ package: pkg, nights }: PackageCardProps) {
  const { flight, accommodation, totalPrice, score } = pkg

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Ottimo'
    if (score >= 60) return 'Buono'
    return 'Discreto'
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
      {/* Header con Score */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
              {score}/100 - {getScoreLabel(score)}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalPrice)}</div>
            <div className="text-sm text-gray-600">per {nights} notti</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Sezione Volo */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <Plane className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Volo</h3>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium text-gray-900">{flight.airline}</div>
                <div className="text-sm text-gray-600">{flight.flightNumber}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(flight.price)}</div>
                <div className="text-sm text-gray-600">{flight.aircraft}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="font-medium">{flight.origin}</div>
                  <div className="text-gray-600">{formatTime(flight.departureTime)}</div>
                </div>
                <div className="flex items-center text-gray-400">
                  <div className="w-8 border-t border-gray-300"></div>
                  <Clock className="w-4 h-4 mx-2" />
                  <div className="w-8 border-t border-gray-300"></div>
                </div>
                <div>
                  <div className="font-medium">{flight.destination}</div>
                  <div className="text-gray-600">{formatTime(flight.arrivalTime)}</div>
                </div>
              </div>
              <div className="text-gray-600">
                {formatDuration(flight.duration)}
              </div>
            </div>
          </div>
        </div>

        {/* Sezione Alloggio */}
        <div>
          <div className="flex items-center mb-3">
            <MapPin className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Alloggio</h3>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-medium text-gray-900">{accommodation.name}</div>
                <div className="text-sm text-gray-600 capitalize">{accommodation.type.toLowerCase()}</div>
                <div className="text-sm text-gray-500">{accommodation.address}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center mb-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 font-medium">{accommodation.rating}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {formatCurrency(accommodation.pricePerNight)}/notte
                </div>
              </div>
            </div>

            {/* Servizi */}
            <div className="flex flex-wrap gap-2 mt-3">
              {accommodation.amenities.slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {amenity === 'WiFi Gratuito' && <Wifi className="w-3 h-3 mr-1" />}
                  {amenity}
                </span>
              ))}
              {accommodation.amenities.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{accommodation.amenities.length - 4} altri
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pulsante Prenotazione */}
        <div className="mt-6 pt-4 border-t">
          <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all">
            Seleziona Pacchetto
          </button>
        </div>
      </div>
    </div>
  )
}