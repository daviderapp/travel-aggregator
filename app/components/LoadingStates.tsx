import { Plane, MapPin, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Loading Spinner generico
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }
  
  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`} />
  )
}

// Loading per ricerca pacchetti
export function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <Plane className="w-16 h-16 text-blue-600 mx-auto animate-bounce" />
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <LoadingSpinner size="sm" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ricerca in corso...
        </h2>
        <p className="text-gray-600 mb-4">
          Stiamo analizzando migliaia di combinazioni per trovare i pacchetti migliori
        </p>
        <div className="flex justify-center space-x-2 text-sm text-gray-500">
          <span className="animate-pulse">🔍 Ricerca voli</span>
          <span>•</span>
          <span className="animate-pulse delay-75">🏨 Ricerca alloggi</span>
          <span>•</span>
          <span className="animate-pulse delay-150">⚡ Calcolo score</span>
        </div>
      </div>
    </div>
  )
}

// Loading per card pacchetti (skeleton)
export function PackageCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden animate-pulse">
      <div className="bg-gray-100 p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <div className="h-5 bg-gray-200 rounded w-16 mb-3"></div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        
        <div>
          <div className="h-5 bg-gray-200 rounded w-20 mb-3"></div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  )
}

// Stato errore generico
export function ErrorState({ 
  title = "Ops! Qualcosa è andato storto",
  message = "Si è verificato un errore imprevisto",
  actionLabel = "Torna alla Home",
  actionHref = "/",
  onRetry
}: {
  title?: string
  message?: string
  actionLabel?: string  
  actionHref?: string
  onRetry?: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-8">{message}</p>
        
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Riprova
            </button>
          )}
          <Link 
            href={actionHref}
            className="block w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}

// Stato vuoto per nessun risultato
export function EmptyState({
  title = "Nessun risultato trovato",
  message = "Prova a modificare i filtri o le date di ricerca",
  showSearchAgain = true
}: {
  title?: string
  message?: string
  showSearchAgain?: boolean
}) {
  return (
    <div className="text-center py-16">
      <div className="text-gray-300 text-8xl mb-6">🔍</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">{message}</p>
      
      {showSearchAgain && (
        <div className="space-y-3">
          <Link 
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nuova Ricerca
          </Link>
          <p className="text-sm text-gray-500">
            oppure modifica i filtri nella sidebar
          </p>
        </div>
      )}
    </div>
  )
}