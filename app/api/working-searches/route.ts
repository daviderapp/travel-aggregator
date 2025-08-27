import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Recupera tutte le destinazioni effettivamente presenti nel DB
    const destinations = await prisma.destination.findMany({
      select: {
        id: true,
        name: true,
        country: true,
        airportCode: true,
        _count: {
          select: {
            flights: true,
            accommodations: true
          }
        }
      }
    })

    // Per ogni destinazione, trova voli e alloggi disponibili
    const workingSearches = []

    for (const dest of destinations) {
      if (dest._count.flights === 0 || dest._count.accommodations === 0) {
        continue // Salta destinazioni senza voli o alloggi
      }

      // Prendi un campione di voli per questa destinazione
      const sampleFlights = await prisma.flight.findMany({
        where: { destinationId: dest.id },
        take: 3,
        orderBy: { price: 'asc' }
      })

      // Prendi un campione di alloggi
      const sampleAccommodations = await prisma.accommodation.findMany({
        where: { destinationId: dest.id },
        take: 3,
        orderBy: { pricePerNight: 'asc' }
      })

      if (sampleFlights.length === 0 || sampleAccommodations.length === 0) {
        continue
      }

      // Calcola range di prezzi realistici...
      const minFlightPrice = Math.min(...sampleFlights.map(f => f.price))
      const maxFlightPrice = Math.max(...sampleFlights.map(f => f.price))
      const minAccommodationPrice = Math.min(...sampleAccommodations.map(a => a.pricePerNight))
      const maxAccommodationPrice = Math.max(...sampleAccommodations.map(a => a.pricePerNight))

      // Calcola budget suggeriti (per 3 notti)
      const budgetLow = Math.ceil((minFlightPrice + minAccommodationPrice * 3) * 1.1) // +10% margine
      const budgetMid = Math.ceil((maxFlightPrice + maxAccommodationPrice * 3) * 1.2)
      const budgetHigh = Math.ceil(budgetMid * 1.5)

      // Trova il nome esatto da usare nella ricerca (lowercase della prima parola)
      const searchKeyword = dest.name.toLowerCase().split(',')[0].split(' ')[0]

      workingSearches.push({
        destination: {
          name: dest.name,
          searchKeyword, // Questo è quello da usare nel form!
          country: dest.country,
          airportCode: dest.airportCode
        },
        availability: {
          flights: dest._count.flights,
          accommodations: dest._count.accommodations
        },
        budgetSuggestions: {
          budget: budgetLow,
          comfortable: budgetMid,
          luxury: budgetHigh
        },
        sampleSearchUrls: {
          budget: `/search?destination=${searchKeyword}&checkIn=2025-09-15&checkOut=2025-09-18&guests=2&budget=${budgetLow}&preferences=${encodeURIComponent(JSON.stringify({
            accommodationType: ['HOTEL', 'HOSTEL'],
            priceRange: 'budget',
            amenities: ['WiFi Gratuito'],
            flightPreference: 'cheapest'
          }))}`,
          comfortable: `/search?destination=${searchKeyword}&checkIn=2025-09-20&checkOut=2025-09-23&guests=2&budget=${budgetMid}&preferences=${encodeURIComponent(JSON.stringify({
            accommodationType: ['HOTEL'],
            priceRange: 'mid',
            amenities: ['WiFi Gratuito', 'Ristorante'],
            flightPreference: 'best_time'
          }))}`,
          luxury: `/search?destination=${searchKeyword}&checkIn=2025-09-25&checkOut=2025-09-28&guests=2&budget=${budgetHigh}&preferences=${encodeURIComponent(JSON.stringify({
            accommodationType: ['HOTEL', 'RESORT'],
            priceRange: 'luxury',
            amenities: ['WiFi Gratuito', 'Spa', 'Ristorante', 'Palestra'],
            flightPreference: 'best_time'
          }))}`
        }
      })
    }

    return NextResponse.json({
      message: "Ricerche garantite per funzionare con i tuoi dati",
      count: workingSearches.length,
      searches: workingSearches,
      instructions: {
        howToUse: "Usa il campo 'searchKeyword' nel form di ricerca, NON il nome completo",
        example: `Per Parigi usa 'parigi', non 'Parigi, Francia'`
      }
    })

  } catch (error) {
    console.error('Errore nel generare ricerche funzionanti:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}