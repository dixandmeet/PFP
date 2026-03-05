"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import Script from "next/script"

interface GoogleMapsContextType {
  isLoaded: boolean
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({ isLoaded: false })

export function useGoogleMaps() {
  return useContext(GoogleMapsContext)
}

interface GoogleMapsProviderProps {
  children: React.ReactNode
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  // Check if already loaded (e.g. from cache or another instance)
  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      setIsLoaded(true)
    }
  }, [])

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ""

  return (
    <GoogleMapsContext.Provider value={{ isLoaded }}>
      {!isLoaded && apiKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr`}
          strategy="afterInteractive"
          onLoad={() => setIsLoaded(true)}
          onError={(e) => console.error("Google Maps script failed to load:", e)}
        />
      )}
      {children}
    </GoogleMapsContext.Provider>
  )
}
