import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TravelAggregator - Pacchetti Viaggio Personalizzati',
  description: 'Trova il pacchetto viaggio perfetto combinando voli e alloggi. Confronta prezzi, recensioni e servizi per le migliori destinazioni europee.',
  keywords: 'viaggi, pacchetti viaggio, voli, hotel, vacanze, europa, aggregatore',
  authors: [{ name: 'Davide Rapp' }],
  openGraph: {
    title: 'TravelAggregator - Pacchetti Viaggio Personalizzati',
    description: 'Trova il pacchetto viaggio perfetto combinando voli e alloggi.',
    type: 'website',
    locale: 'it_IT'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}