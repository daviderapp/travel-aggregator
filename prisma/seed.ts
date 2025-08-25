import { PrismaClient, AccommodationType } from '@prisma/client'

const prisma = new PrismaClient()

const destinations = [
  {
    name: "Parigi",
    country: "Francia",
    airportCode: "CDG",
    imageUrl: "https://images.unsplash.com/photo-1502602898536-47ad22581b52",
    description: "La città dell'amore e delle luci"
  },
  {
    name: "Barcellona", 
    country: "Spagna",
    airportCode: "BCN",
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded",
    description: "Arte, architettura e vita notturna"
  },
  {
    name: "Amsterdam",
    country: "Olanda", 
    airportCode: "AMS",
    imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017",
    description: "Canali, musei e cultura liberale"
  },
  {
    name: "Berlino",
    country: "Germania",
    airportCode: "BER", 
    imageUrl: "https://images.unsplash.com/photo-1560969184-10fe8719e047",
    description: "Storia, arte e vita notturna"
  },
  {
    name: "Praga",
    country: "Repubblica Ceca",
    airportCode: "PRG",
    imageUrl: "https://images.unsplash.com/photo-1541849546-216549ae216d",
    description: "Architettura medievale e birra"
  }
]

const airlines = ["Ryanair", "EasyJet", "Lufthansa", "Air France", "KLM", "Vueling", "Wizz Air"]
const aircrafts = ["Boeing 737", "Airbus A320", "Airbus A319", "Boeing 787", "Airbus A330"]

function generateFlights(destinations: any[]) {
  const flights = []
  const origin = "MXP" // Milano Malpensa
  
  for (const dest of destinations) {
    // Genera 15-20 voli per destinazione
    for (let i = 0; i < 18; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)]
      const basePrice = dest.airportCode === "CDG" ? 180 : 
                       dest.airportCode === "BCN" ? 120 :
                       dest.airportCode === "AMS" ? 150 :
                       dest.airportCode === "BER" ? 140 : 100
      
      // Variazione stagionale e oraria
      const priceVariation = 0.7 + (Math.random() * 0.6) // 70% - 130% del prezzo base
      const price = Math.round(basePrice * priceVariation)
      
      // Orari distribuiti nella giornata
      const hour = 6 + Math.floor(Math.random() * 16) // 6:00 - 22:00
      const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)]
      
      const departureTime = new Date()
      departureTime.setHours(hour, minute, 0, 0)
      departureTime.setDate(departureTime.getDate() + Math.floor(Math.random() * 30)) // Prossimi 30 giorni
      
      // Durata realistica basata sulla destinazione
      const baseDuration = dest.airportCode === "CDG" ? 120 :
                          dest.airportCode === "BCN" ? 105 :
                          dest.airportCode === "AMS" ? 110 :
                          dest.airportCode === "BER" ? 95 : 90
      
      const duration = baseDuration + Math.floor(Math.random() * 30) // +0-30 min variazione
      
      const arrivalTime = new Date(departureTime.getTime() + duration * 60000)
      
      flights.push({
        airline,
        flightNumber: `${airline.slice(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
        origin,
        destinationId: dest.id,
        departureTime,
        arrivalTime,
        duration,
        price,
        availableSeats: Math.floor(Math.random() * 50) + 10,
        aircraft: aircrafts[Math.floor(Math.random() * aircrafts.length)]
      })
    }
  }
  
  return flights
}

function generateAccommodations(destinations: any[]) {
  const accommodations = []
  const hotelNames = [
    "Grand Hotel Europa", "City Center Inn", "Boutique Palace", "Modern Suites",
    "Heritage Hotel", "Downtown Hostel", "Luxury Resort", "Cozy B&B",
    "Executive Apartments", "Vintage Villa", "Urban Lodge", "Comfort Inn"
  ]
  
  const amenities = [
    "WiFi Gratuito", "Piscina", "Palestra", "Spa", "Ristorante", 
    "Bar", "Parcheggio", "Animali Ammessi", "Aria Condizionata", 
    "Colazione Inclusa", "Reception 24h", "Centro Business"
  ]
  
  for (const dest of destinations) {
    // Genera 8-12 alloggi per destinazione
    for (let i = 0; i < 10; i++) {
      const type = Object.values(AccommodationType)[
        Math.floor(Math.random() * Object.values(AccommodationType).length)
      ]
      
      const name = `${hotelNames[Math.floor(Math.random() * hotelNames.length)]} ${dest.name}`
      
      // Prezzo base per tipo
      const basePrice = type === 'HOSTEL' ? 25 :
                       type === 'BNB' ? 60 :
                       type === 'APARTMENT' ? 80 :
                       type === 'HOTEL' ? 120 : 200 // RESORT/VILLA
      
      const priceVariation = 0.7 + (Math.random() * 0.8) // 70% - 150%
      const pricePerNight = Math.round(basePrice * priceVariation)
      
      const rating = 3 + Math.random() * 2 // 3.0 - 5.0
      
      // Seleziona 3-6 servizi casuali
      const selectedAmenities = amenities
        .sort(() => 0.5 - Math.random())
        .slice(0, 3 + Math.floor(Math.random() * 4))
      
      accommodations.push({
        name,
        type,
        destinationId: dest.id,
        address: `Via ${Math.floor(Math.random() * 100)} ${dest.name}`,
        rating: Math.round(rating * 10) / 10,
        pricePerNight,
        amenities: selectedAmenities,
        imageUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}`,
        description: `Splendido ${type.toLowerCase()} nel cuore di ${dest.name}`,
        availableRooms: Math.floor(Math.random() * 20) + 5,
        checkInTime: "15:00",
        checkOutTime: "11:00"
      })
    }
  }
  
  return accommodations
}

async function main() {
  console.log('🌱 Inizio seeding del database...')
  
  // Pulisci il database esistente
  await prisma.flight.deleteMany()
  await prisma.accommodation.deleteMany()  
  await prisma.destination.deleteMany()
  await prisma.searchHistory.deleteMany()
  
  console.log('🗑️ Database pulito')
  
  // Crea destinazioni
  console.log('📍 Creazione destinazioni...')
  const createdDestinations = []
  for (const dest of destinations) {
    const created = await prisma.destination.create({
      data: dest
    })
    createdDestinations.push(created)
  }
  
  // Genera e crea voli
  console.log('✈️ Generazione voli...')
  const flights = generateFlights(createdDestinations)
  await prisma.flight.createMany({
    data: flights
  })
  
  // Genera e crea alloggi
  console.log('🏨 Generazione alloggi...')
  const accommodations = generateAccommodations(createdDestinations)
  await prisma.accommodation.createMany({
    data: accommodations
  })
  
  console.log('✅ Seeding completato!')
  console.log(`📊 Statistiche:`)
  console.log(`   - ${createdDestinations.length} destinazioni`)
  console.log(`   - ${flights.length} voli`)
  console.log(`   - ${accommodations.length} alloggi`)
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })