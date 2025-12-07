'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string, lat: number, lng: number) => void
  error?: string
}

// Track if Google Maps script is loaded globally
let googleMapsLoaded = false
let googleMapsLoading = false
const loadCallbacks: (() => void)[] = []

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (googleMapsLoaded) {
      resolve()
      return
    }

    if (googleMapsLoading) {
      loadCallbacks.push(() => resolve())
      return
    }

    googleMapsLoading = true

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=th`
    script.async = true
    script.defer = true

    script.onload = () => {
      googleMapsLoaded = true
      googleMapsLoading = false
      loadCallbacks.forEach(cb => cb())
      loadCallbacks.length = 0
      resolve()
    }

    script.onerror = () => {
      googleMapsLoading = false
      reject(new Error('Failed to load Google Maps'))
    }

    document.head.appendChild(script)
  })
}

export default function AddressAutocomplete({
  value,
  onChange,
  error
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)

  const handlePlaceChange = useCallback(() => {
    const place = autocompleteRef.current?.getPlace()

    if (place?.geometry?.location) {
      const address = place.formatted_address || place.name || ''
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      onChange(address, lat, lng)
    }
  }, [onChange])

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error('Google Maps API key not found')
      setLoadError(true)
      return
    }

    loadGoogleMaps(apiKey)
      .then(() => {
        setIsLoaded(true)

        if (inputRef.current && window.google) {
          autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: 'th' },
            fields: ['formatted_address', 'geometry', 'name'],
            types: ['address']
          })

          autocompleteRef.current.addListener('place_changed', handlePlaceChange)
        }
      })
      .catch((err) => {
        console.error('Failed to load Google Maps:', err)
        setLoadError(true)
      })

    return () => {
      if (autocompleteRef.current && window.google) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [handlePlaceChange])

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        placeholder="ค้นหาที่อยู่..."
        className={`w-full px-4 py-3 border ${error ? 'border-error' : 'border-border'} rounded-lg outline-none focus:ring-2 focus:ring-black focus:ring-offset-1`}
        disabled={!isLoaded && !loadError}
      />
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
      {!isLoaded && !loadError && (
        <p className="mt-2 text-sm text-secondary">กำลังโหลดแผนที่...</p>
      )}
      {loadError && (
        <p className="mt-2 text-sm text-error">ไม่สามารถโหลดแผนที่ได้ กรุณารีเฟรชหน้า</p>
      )}
    </div>
  )
}
