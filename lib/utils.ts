import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TravelPackage, UserPreferences, ScoringWeights } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility per calcolo delle notti
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Algoritmo di scoring personalizzato
export function calculatePackageScore(
  pkg: TravelPackage,
  preferences: UserPreferences,
  userBudget: number
): number {
  const weights: ScoringWeights = {
    price: 0.35,      // 35% - Peso maggiore per il prezzo
    rating: 0.25,     // 25% - Rating importante
    amenities: 0.15,  // 15% - Servizi
    flightTime: 0.15, // 15% - Orari volo
    location: 0.10    // 10% - Posizione
  }

  // Score prezzo (più basso = meglio, normalizzato 0-1)
  const priceScore = Math.max(0, 1 - (pkg.totalPrice / userBudget))
  
  // Score rating (normalizzato 0-1)
  const ratingScore = pkg.accommodation.rating / 5
  
  // Score servizi (basato su match con preferenze)
  const userAmenities = preferences.amenities || []
  const matchingAmenities = pkg.accommodation.amenities.filter(
    amenity => userAmenities.includes(amenity)
  ).length
  const amenitiesScore = userAmenities.length > 0 
    ? matchingAmenities / userAmenities.length 
    : 0.5

  // Score orario volo (preferenza per orari decenti)
  const departureHour = pkg.flight.departureTime.getHours()
  const flightTimeScore = getFlightTimeScore(departureHour, preferences.flightPreference)

  // Score tipo alloggio (match con preferenze)
  const typeScore = preferences.accommodationType.includes(pkg.accommodation.type) ? 1 : 0.3

  // Calcolo score finale
  const finalScore = 
    (priceScore * weights.price) +
    (ratingScore * weights.rating) +
    (amenitiesScore * weights.amenities) +
    (flightTimeScore * weights.flightTime) +
    (typeScore * weights.location)

  return Math.round(finalScore * 100) // Score da 0 a 100
}

function getFlightTimeScore(hour: number, preference: string): number {
  switch (preference) {
    case 'best_time':
      // Preferisce orari 8-12 e 14-18
      if ((hour >= 8 && hour <= 12) || (hour >= 14 && hour <= 18)) return 1
      if (hour >= 6 && hour <= 20) return 0.7
      return 0.3
    case 'cheapest':
      // Non importa l'orario
      return 0.5
    case 'shortest':
      // Preferisce voli diretti (simuliamo con orari standard)
      return hour >= 9 && hour <= 17 ? 0.8 : 0.5
    default:
      return 0.5
  }
}

// Utility per formattazione
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '--/--/----'
  
  const dateObj = date instanceof Date ? date : new Date(date)
  
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date passed to formatDate:', date)
    return '--/--/----'
  }
  
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj)
}

export function formatTime(date: Date | string | null | undefined): string {
  // Controllo di validità
  if (!date) return '--:--'
  
  const dateObj = date instanceof Date ? date : new Date(date)
  
  // Verifica se la data è valida
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date passed to formatTime:', date)
    return '--:--'
  }
  
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}
// Validazione date
export function isValidDateRange(checkIn: Date, checkOut: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return checkIn >= today && checkOut > checkIn
}

// Generazione mock data helper
export function generateRandomPrice(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateRandomRating(): number {
  // Genera rating tra 3.0 e 5.0 con bias verso valori più alti
  return Math.round((Math.random() * 2 + 3) * 10) / 10
}