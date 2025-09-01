'use client'
import SearchForm from './components/SearchForm'
import { Plane, MapPin, Star, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plane className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TravelAggregator</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Navigation */}
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Come Funziona
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Destinazioni
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Contatti
                </a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            Trova il <span className="text-blue-600 dark:text-blue-400">pacchetto viaggio</span> perfetto
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto transition-colors duration-300">
            Confrontiamo voli e alloggi per creare combinazioni personalizzate che si adattano 
            al tuo budget e alle tue preferenze. Risparmia tempo e denaro!
          </p>
        </div>

        {/* Form di Ricerca */}
        <SearchForm />
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 transition-colors duration-300">
            Perché scegliere TravelAggregator?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                Algoritmo Intelligente
              </h4>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Il nostro algoritmo analizza migliaia di combinazioni per trovare 
                il pacchetto che meglio si adatta alle tue esigenze e budget.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                <Star className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                Qualità Garantita
              </h4>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Solo strutture e voli verificati con recensioni autentiche. 
                La tua soddisfazione è la nostra priorità.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                Destinazioni Curate
              </h4>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Scopri le migliori destinazioni europee con pacchetti 
                ottimizzati per ogni tipo di viaggiatore.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Plane className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold">TravelAggregator</span>
              </div>
              <p className="text-gray-400 dark:text-gray-500">
                Il tuo aggregatore di fiducia per pacchetti viaggio personalizzati.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Destinazioni</h5>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">Parigi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Barcellona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Amsterdam</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Berlino</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Supporto</h5>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contattaci</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termini</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Azienda</h5>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">Chi Siamo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Lavora con Noi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500">
            <p>&copy; 2025 TravelAggregator. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}