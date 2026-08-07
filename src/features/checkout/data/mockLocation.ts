interface DetectedLocation {
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
}

/** Simulates reverse-geocoding a detected GPS position — no real geolocation/maps API involved. */
export function detectCurrentLocation(): Promise<DetectedLocation> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        line1: 'Road No. 12, Banjara Hills',
        line2: 'Near City Central Mall',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500034',
      })
    }, 1100)
  })
}
