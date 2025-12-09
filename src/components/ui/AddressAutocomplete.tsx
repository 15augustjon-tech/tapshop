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
  const [hasLocation, setHasLocation] = useState(false)
  const [inputValue, setInputValue] = useState(value)

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
              setInputValue(address)
              setHasLocation(true)

              // Update input field
              if (inputRef.current) {
                inputRef.current.value = address
              }
            } else {
              // No address found, just use coordinates
              const coordStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              onChange(coordStr, latitude, longitude)
              setInputValue(coordStr)
              setHasLocation(true)
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
        timeout: 15000,
        maximumAge: 60000
      }
    )
  }, [onChange])

  const handlePlaceChange = useCallback(() => {
    const place = autocompleteRef.current?.getPlace()

    if (place?.geometry?.location) {
      const address = place.formatted_address || place.name || ''
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      onChange(address, lat, lng)
      setInputValue(address)
      setHasLocation(true)
    }
  }, [onChange])

  // Handle manual text input (for cases when user just types)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // If user clears the field, reset
    if (!newValue) {
      setHasLocation(false)
    }
  }

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
            fields: ['formatted_address', 'geometry', 'name']
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

  // Set initial value
  useEffect(() => {
    if (value) {
      setInputValue(value)
      setHasLocation(true)
    }
  }, [value])

  return (
    <div className="w-full space-y-3">
      {/* Current Location Button - Big and Prominent */}
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={!isLoaded || gettingLocation}
        className="w-full py-4 px-4 bg-black text-white rounded-lg font-semibold flex items-center justify-center gap-3 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {gettingLocation ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>กำลังหาตำแหน่ง...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <p className="text-sm text-error text-center">{locationError}</p>
      )}

      {/* Success indicator */}
      {hasLocation && !gettingLocation && (
        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          <span className="text-sm">ได้ตำแหน่งแล้ว</span>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-secondary">หรือค้นหาที่อยู่</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Address Input */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="พิมพ์ชื่อสถานที่ ถนน หรือซอย..."
        className={`w-full px-4 py-3 border ${error ? 'border-error' : 'border-border'} rounded-lg outline-none focus:ring-2 focus:ring-black focus:ring-offset-1`}
        disabled={!isLoaded && !loadError}
      />

      {/* Display selected address */}
      {hasLocation && inputValue && (
        <p className="text-sm text-secondary px-1">
          📍 {inputValue}
        </p>
      )}

      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
      {!isLoaded && !loadError && (
        <p className="text-sm text-secondary">กำลังโหลดแผนที่...</p>
      )}
      {loadError && (
        <p className="text-sm text-error">ไม่สามารถโหลดแผนที่ได้ กรุณารีเฟรชหน้า</p>
      )}
    </div>
  )
}
