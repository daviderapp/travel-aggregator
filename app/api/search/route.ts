import { NextRequest, NextResponse } from 'next/server'
import { AccommodationType, PrismaClient } from '@prisma/client'
import { 
  TravelPackage, 
  UserPreferences, 
  SearchResponse,
  FlightDetails,
  AccommodationDetails
} from '@/lib/types'
import { calculatePackageScore, calculateNights } from '@/lib/utils'

function extractFirstJsonObject(input: string): string {
  const s = input.trim();
  const start = s.indexOf('{');
  if (start === -1) throw new Error('Nessuna { trovata');
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) { esc = false; }
      else if (ch === '\\') { esc = true; }
      else if (ch === '"') { inStr = false; }
    } else {
      if (ch === '"') inStr = true;
      else if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          return s.slice(start, i + 1); // oggetto completo
        }
      }
    }
  }
  throw new Error('JSON object non bilanciato (probabile risposta troncata)');
}


const prisma = new PrismaClient()

// Configurazione per chiamate Hugging Face
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY
const HUGGINGFACE_API_URL = 'https://router.huggingface.co/v1/chat/completions'

interface AIResponse {
  destination: string | null
  checkIn: string | null
  checkOut: string | null  
  guests: number | null
  maxBudget: number | null
  preferences: {
    accommodation_type?: string[]
    location?: string
    activity_level?: string
    price_range?: 'budget' | 'mid' | 'luxury'
    amenities?: string[]
    flight_preference?: string
  }
  confidence_score: number
}

// Mappa città per normalizzazione
const cityMapping: Record<string, string> = {
  'parigi': 'parigi',
  'paris': 'parigi',
  'barcellona': 'barcellona',
  'barcelona': 'barcellona',
  'amsterdam': 'amsterdam',
  'berlino': 'berlino',
  'berlin': 'berlino',
  'praga': 'praga',
  'prague': 'praga'
}

const accommodationTypeMapping: Record<string, AccommodationType[]> = {
  'hotel': ['HOTEL'],
  'hotel elegante': ['HOTEL'],
  'hotel di lusso': ['HOTEL'],
  'ostello': ['HOSTEL'],
  'hostel': ['HOSTEL'],
  'appartamento': ['APARTMENT'],
  'apartment': ['APARTMENT'],
  'b&b': ['BNB'],
  'bed and breakfast': ['BNB'],
  'resort': ['RESORT']
}

async function processAIQuery(query: string): Promise<{
  destination: string | null,
  checkIn: string | null,
  checkOut: string | null,
  guests: number,
  budget: number,
  preferences: UserPreferences
}> {
  const systemPrompt = `You are a travel parameter extraction AI. Extract travel information from user requests and respond ONLY with valid JSON.

Extract these fields:
- destination: city name in Italian (parigi, barcellona, amsterdam, berlino, praga)
- checkIn: YYYY-MM-DD format or null if not specified
- checkOut: YYYY-MM-DD format or null if not specified  
- guests: number of people or null
- maxBudget: budget in euros or null
- preferences: object with:
  * accommodation_type: array of strings like ["hotel", "ostello"]
  * location: string like "centro storico", "vicino stazione"
  * activity_level: "relax" | "cultural" | "adventure" | "party"
  * price_range: "budget" | "mid" | "luxury"
  * amenities: array of strings like ["piscina", "spa", "colazione"]
  * flight_preference: "cheapest" | "shortest" | "best_time"
- confidence_score: 0-1 (how confident you are in the extraction)

Respond ONLY with JSON, no other text.`

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query }
  ]

  
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error('Servizio AI non configurato (503)');
  }
  const response = await fetch(HUGGINGFACE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    
    body: JSON.stringify({
      messages,
      model: 'openai/gpt-oss-120b:cerebras',
      stream: false,
      max_tokens: 600,
      temperature: 0.1
    })
  })

  console.log("messaggi inviati a HF:", messages); // <— log

  if (!response.ok) {
    const txt = await response.text().catch(() => '');
    console.error('HF non OK', response.status, txt); // <— log
    throw new Error('Errore nel servizio AI')
  }

  const data = await response.json().catch(e => {
  console.error('HF: response.json() failed', e);
  throw e;
});

const content = data?.choices?.[0]?.message?.content;
if (!content) {
  console.error('HF: content mancante', data);
  throw new Error('Formato risposta inatteso da HF');
}

let aiResponse: AIResponse;
try {
  const jsonStr = extractFirstJsonObject(String(content));
  aiResponse = JSON.parse(jsonStr);
  console.log('HF: Parsed JSON', aiResponse);
} catch (e) {
  console.error('HF: contenuto non JSON valido', { content });
  throw e;
}


  // Normalizza i dati estratti
  const destination = aiResponse.destination ? 
    cityMapping[aiResponse.destination.toLowerCase()] || aiResponse.destination : 
    null

  // Genera date di default se non specificate
  let checkIn = aiResponse.checkIn
  let checkOut = aiResponse.checkOut

  if (!checkIn) {
    const nextWeekend = new Date()
    nextWeekend.setDate(nextWeekend.getDate() + (6 - nextWeekend.getDay()))
    checkIn = nextWeekend.toISOString().split('T')[0]
  }

  if (!checkOut) {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkInDate)
    checkOutDate.setDate(checkInDate.getDate() + 2) // Default 2 notti
    checkOut = checkOutDate.toISOString().split('T')[0]
  }

  // Normalizza tipo alloggio
  let accommodationType: AccommodationType[] = ['HOTEL'] // Default
  if (aiResponse.preferences?.accommodation_type) {
    accommodationType = []
    aiResponse.preferences.accommodation_type.forEach(type => {
      const mapped = accommodationTypeMapping[type.toLowerCase()]
      if (mapped) accommodationType.push(...mapped)
    })
    if (accommodationType.length === 0) accommodationType = ['HOTEL']
  }

  // Normalizza amenities
  const amenitiesMapping: Record<string, string> = {
    'piscina': 'Piscina',
    'pool': 'Piscina',
    'spa': 'Spa',
    'palestra': 'Palestra',
    'colazione': 'Colazione Inclusa',
    'wifi': 'WiFi Gratuito',
    'parcheggio': 'Parcheggio',
    'bar': 'Bar',
    'ristorante': 'Ristorante'
  }

  let amenities: string[] = []
  if (aiResponse.preferences?.amenities) {
    aiResponse.preferences.amenities.forEach(amenity => {
      const mapped = amenitiesMapping[amenity.toLowerCase()] || amenity
      if (!amenities.includes(mapped)) amenities.push(mapped)
    })
  }

  const preferences: UserPreferences = {
    accommodationType,
    priceRange: aiResponse.preferences?.price_range || 'mid',
    amenities,
    flightPreference: (aiResponse.preferences?.flight_preference as 'cheapest' | 'shortest' | 'best_time') || 'best_time'
  }

  return {
    destination,
    checkIn,
    checkOut,
    guests: aiResponse.guests || 2,
    budget: aiResponse.maxBudget || 800,
    preferences
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'classic'
    
    let destination: string | null
    let checkIn: string | null
    let checkOut: string | null
    let guests: number
    let budget: number
    let preferences: UserPreferences
    let originalQuery: string | undefined

    if (mode === 'ai') {
      // Gestione ricerca AI
      const query = searchParams.get('query')
      if (!query) {
        return NextResponse.json(
          { error: 'Query AI richiesta' },
          { status: 400 }
        )
      }

      originalQuery = query
      
      try {
        const aiData = await processAIQuery(query)
        destination = aiData.destination
        checkIn = aiData.checkIn
        checkOut = aiData.checkOut
        guests = aiData.guests
        budget = aiData.budget
        preferences = aiData.preferences
      } catch (aiError) {
        return NextResponse.json(
          { error: 'Non riesco a comprendere la tua richiesta. Prova a essere più specifico.' },
          { status: 400 }
        )
      }
    } else {
      // Gestione ricerca classica (codice esistente)
      destination = searchParams.get('destination')
      checkIn = searchParams.get('checkIn')
      checkOut = searchParams.get('checkOut')
      guests = parseInt(searchParams.get('guests') || '2')
      budget = parseFloat(searchParams.get('budget') || '800')
      const preferencesStr = searchParams.get('preferences')
      
      try {
        preferences = preferencesStr ? JSON.parse(preferencesStr) : {
          accommodationType: ['HOTEL'],
          priceRange: 'mid',
          amenities: [],
          flightPreference: 'best_time'
        }
      } catch {
        preferences = {
          accommodationType: ['HOTEL'],
          priceRange: 'mid', 
          amenities: [],
          flightPreference: 'best_time'
        }
      }
    }

    // Validazione parametri
    if (!destination || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Parametri mancanti: destination, checkIn, checkOut sono richiesti' },
        { status: 400 }
      )
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const nights = calculateNights(checkInDate, checkOutDate)

    // Query database per destinazione (resto del codice invariato)
    const destinationData = await prisma.destination.findFirst({
      where: {
        name: {
          contains: destination,
          mode: 'insensitive'
        }
      }
    })

    if (!destinationData) {
      return NextResponse.json(
        { error: 'Destinazione non trovata' },
        { status: 404 }
      )
    }

    // Query voli disponibili
    const flights = await prisma.flight.findMany({
      where: {
        destinationId: destinationData.id,
        departureTime: {
          gte: checkInDate,
          lte: new Date(checkInDate.getTime() + 86400000)
        },
        availableSeats: {
          gte: guests
        },
        price: {
          lte: budget * 0.6
        }
      },
      orderBy: [
        { price: 'asc' },
        { departureTime: 'asc' }
      ]
    })

    // Query alloggi disponibili  
    const accommodations = await prisma.accommodation.findMany({
      where: {
        destinationId: destinationData.id,
        type: {
          in: preferences.accommodationType.length > 0 
            ? preferences.accommodationType 
            : undefined
        },
        availableRooms: {
          gte: Math.ceil(guests / 2)
        },
        pricePerNight: {
          lte: (budget * 0.7) / nights
        }
      },
      orderBy: [
        { rating: 'desc' },
        { pricePerNight: 'asc' }
      ]
    })

    // Genera combinazioni di pacchetti
    const packages: TravelPackage[] = []
    
    for (const flight of flights.slice(0, 15)) {
      for (const accommodation of accommodations.slice(0, 10)) {
        const accommodationTotalPrice = accommodation.pricePerNight * nights
        const totalPrice = flight.price + accommodationTotalPrice
        
        if (totalPrice <= budget) {
          const flightDetails: FlightDetails = {
            id: flight.id,
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            origin: flight.origin,
            destination: destinationData.airportCode,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            duration: flight.duration,
            price: flight.price,
            aircraft: flight.aircraft
          }

          const accommodationDetails: AccommodationDetails = {
            id: accommodation.id,
            name: accommodation.name,
            type: accommodation.type,
            address: accommodation.address,
            rating: accommodation.rating,
            pricePerNight: accommodation.pricePerNight,
            totalNights: nights,
            totalPrice: accommodationTotalPrice,
            amenities: accommodation.amenities,
            imageUrl: accommodation.imageUrl,
            description: accommodation.description
          }

          const pkg: TravelPackage = {
            id: `${flight.id}-${accommodation.id}`,
            flight: flightDetails,
            accommodation: accommodationDetails,
            totalPrice,
            score: 0
          }

          pkg.score = calculatePackageScore(pkg, preferences, budget)
          packages.push(pkg)
        }
      }
    }

    // Ordina per score e prendi i migliori 10
    const topPackages = packages
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    // Calcola filtri per la UI
    const priceRange = packages.length > 0 ? {
      min: Math.min(...packages.map(p => p.totalPrice)),
      max: Math.max(...packages.map(p => p.totalPrice))
    } : { min: 0, max: 0 }

    const ratings = [...new Set(packages.map(p => Math.floor(p.accommodation.rating)))]
      .sort((a, b) => b - a)

    const airlines = [...new Set(packages.map(p => p.flight.airline))]
      .sort()

    const accommodationTypes = [...new Set(packages.map(p => p.accommodation.type))] as AccommodationType[]

    // Salva ricerca nello storico
    await prisma.searchHistory.create({
      data: {
        destination: destinationData.name,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        budget,
        preferences: preferences as any,
        resultsCount: topPackages.length,
        // searchMode: mode,              // Commenta fino alla migrazione
        // originalQuery: originalQuery   // Commenta fino alla migrazione
      }
    })

    const response: SearchResponse = {
      packages: topPackages,
      total: topPackages.length,
      searchTime: Date.now() - startTime,
      filters: {
        priceRange,
        ratings,
        airlines,
        accommodationTypes
      },
      mode: mode as 'classic' | 'ai',
      originalQuery
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Errore nella ricerca:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}