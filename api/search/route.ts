import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { 
  TravelPackage, 
  UserPreferences, 
  SearchResponse,
  FlightDetails,
  AccommodationDetails
} from '@/lib/types'
import { calculatePackageScore, calculateNights } from '@/lib/utils'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    
    // Estrai parametri dalla query
    const destination = searchParams.get('destination')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const guests = parseInt(searchParams.get('guests') || '2')
    const budget = parseFloat(searchParams.get('budget') || '800')
    const preferencesStr = searchParams.get('preferences')
    
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
    
    let preferences: UserPreferences
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

    // Query database per destinazione
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
          lte: new Date(checkInDate.getTime() + 86400000) // Stesso giorno o giorno dopo
        },
        availableSeats: {
          gte: guests
        },
        price: {
          lte: budget * 0.6 // Max 60% del budget per il volo
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
          gte: Math.ceil(guests / 2) // Assumiamo 2 persone per stanza
        },
        pricePerNight: {
          lte: (budget * 0.7) / nights // Max 70% del budget per alloggio
        }
      },
      orderBy: [
        { rating: 'desc' },
        { pricePerNight: 'asc' }
      ]
    })

    // Genera combinazioni di pacchetti
    const packages: TravelPackage[] = []
    
    for (const flight of flights.slice(0, 15)) { // Limita a 15 voli migliori
      for (const accommodation of accommodations.slice(0, 10)) { // Limita a 10 alloggi migliori
        const accommodationTotalPrice = accommodation.pricePerNight * nights
        const totalPrice = flight.price + accommodationTotalPrice
        
        // Filtra per budget
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
            score: 0 // Calcolato dopo
          }

          // Calcola score personalizzato
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
    const priceRange = {
      min: Math.min(...packages.map(p => p.totalPrice)),
      max: Math.max(...packages.map(p => p.totalPrice))
    }

    const ratings = [...new Set(packages.map(p => Math.floor(p.accommodation.rating)))]
      .sort((a, b) => b - a)

    const airlines = [...new Set(packages.map(p => p.flight.airline))]
      .sort()

    const accommodationTypes = [...new Set(packages.map(p => p.accommodation.type))]

    // Salva ricerca nello storico
    await prisma.searchHistory.create({
      data: {
        destination: destinationData.name,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        budget,
        preferences: preferences as any,
        resultsCount: topPackages.length
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
      }
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