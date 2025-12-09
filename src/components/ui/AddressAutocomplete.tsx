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
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState('')

  const handlePlaceChange = useCallback(() => {
    const place = autocompleteRef.current?.getPlace()

    if (place?.geometry?.location) {
      const address = place.formatted_address || place.name || ''
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      onChange(address, lat, lng)
    }
  }, [onChange])

  // Get current location using GPS
  const handleGetCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง')
      return
    }

    setGettingLocation(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Reverse geocode to get address
          if (window.google) {
            const geocoder = new google.maps.Geocoder()
            const response = await geocoder.geocode({
              location: { lat: latitude, lng: longitude }
            })

            if (response.results[0]) {
              const address = response.results[0].formatted_address
              onChange(address, latitude, longitude)

              // Update input field
              if (inputRef.current) {
                inputRef.current.value = address
              }
            } else {
              // No address found, just use coordinates
              onChange(`${latitude}, ${longitude}`, latitude, longitude)
            }
          }
        } catch (err) {
          console.error('Geocoding error:', err)
          setLocationError('ไม่สามารถหาที่อยู่ได้')
        } finally {
          setGettingLocation(false)
        }
      },
      (err) => {
        setGettingLocation(false)
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError('กรุณาอนุญาตการเข้าถึงตำแหน่ง')
            break
          case err.POSITION_UNAVAILABLE:
            setLocationError('ไม่สามารถระบุตำแหน่งได้')
            break
          case err.TIMEOUT:
            setLocationError('หมดเวลาในการระบุตำแหน่ง')
            break
          default:
            setLocationError('เกิดข้อผิดพลาด')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
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
      {/* Current Location Button */}
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={!isLoaded || gettingLocation}
        className="w-full mb-3 py-3 px-4 border border-border rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {gettingLocation ? (
          <>
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span>กำลังหาตำแหน่ง...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4"/>
              <path d="M12 18v4"/>
              <path d="M2 12h4"/>
              <path d="M18 12h4"/>
            </svg>
            <span>ใช้ตำแหน่งปัจจุบัน</span>
          </>
        )}
      </button>

      {locationError && (
        <p className="mb-3 text-sm text-error">{locationError}</p>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-secondary">หรือค้นหาที่อยู่</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Address Input */}
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        placeholder="พิมพ์ค้นหาที่อยู่..."
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
