import { SERVICE_AREA } from '@/lib/constants'

interface DetectedLocation {
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
  lat: number
  lng: number
}

/** Simulates reverse-geocoding a detected GPS position — no real geolocation/maps API involved. */
export function detectCurrentLocation(): Promise<DetectedLocation> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        line1: 'Trivandrum Road, near Nellai Bus Stand',
        line2: 'Near Nellai Fort',
        city: 'Tirunelveli',
        state: 'Tamil Nadu',
        pincode: '627001',
        lat: SERVICE_AREA.centerLat + 0.012,
        lng: SERVICE_AREA.centerLng + 0.009,
      })
    }, 1100)
  })
}
