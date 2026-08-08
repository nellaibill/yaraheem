import { useRef, type MouseEvent } from 'react'
import { MapPin, UtensilsCrossed } from 'lucide-react'
import { distanceFromServiceCenterKm, isWithinServiceArea } from '@/lib/geo'
import { SERVICE_AREA } from '@/lib/constants'
import { cn } from '@/lib/utils'

const BOX_RADIUS_KM = 20
const KM_TO_DEG_LAT = 1 / 111
const KM_TO_DEG_LNG = 1 / (111 * Math.cos((SERVICE_AREA.centerLat * Math.PI) / 180))

function latLngToPercent(lat: number, lng: number) {
  const dxKm = (lng - SERVICE_AREA.centerLng) / KM_TO_DEG_LNG
  const dyKm = (lat - SERVICE_AREA.centerLat) / KM_TO_DEG_LAT
  const xPercent = 50 + (dxKm / BOX_RADIUS_KM) * 50
  const yPercent = 50 - (dyKm / BOX_RADIUS_KM) * 50
  return {
    left: `${Math.min(100, Math.max(0, xPercent))}%`,
    top: `${Math.min(100, Math.max(0, yPercent))}%`,
  }
}

/**
 * Stylized, non-interactive-with-real-maps location picker — no live map API.
 * A "pin" position maps to a mock lat/lng offset from the Melapalayam service center.
 */
export function MockMapPicker({
  lat,
  lng,
  onPick,
  editable = true,
}: {
  lat: number | null
  lng: number | null
  onPick?: (lat: number, lng: number) => void
  editable?: boolean
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const hasPin = lat !== null && lng !== null
  const withinArea = hasPin ? isWithinServiceArea(lat, lng) : true
  const distanceKm = hasPin ? distanceFromServiceCenterKm(lat, lng) : 0
  const serviceRadiusPercent = (SERVICE_AREA.radiusKm / BOX_RADIUS_KM) * 50

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (!editable || !onPick) return
    const rect = event.currentTarget.getBoundingClientRect()
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100
    const dxKm = ((xPercent - 50) / 50) * BOX_RADIUS_KM
    const dyKm = ((50 - yPercent) / 50) * BOX_RADIUS_KM
    onPick(SERVICE_AREA.centerLat + dyKm * KM_TO_DEG_LAT, SERVICE_AREA.centerLng + dxKm * KM_TO_DEG_LNG)
  }

  const pinPosition = hasPin ? latLngToPercent(lat, lng) : { left: '50%', top: '50%' }

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={boxRef}
        onClick={handleClick}
        className={cn(
          'from-primary relative h-56 w-full overflow-hidden rounded-xl bg-gradient-to-br to-[#3a0d18]',
          editable && 'cursor-crosshair',
        )}
      >
        <div className="bg-noise absolute inset-0 text-white/[0.06]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Service-area boundary ring */}
        <div
          className="border-gold/50 absolute rounded-full border-2 border-dashed"
          style={{
            left: '50%',
            top: '50%',
            width: `${serviceRadiusPercent * 2}%`,
            height: `${serviceRadiusPercent * 2}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        {/* Restaurant location */}
        <div
          className="absolute flex flex-col items-center gap-1"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <span className="bg-gold text-gold-foreground flex size-8 items-center justify-center rounded-full shadow-lg">
            <UtensilsCrossed className="size-4" />
          </span>
          <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-medium text-white">Ya Raheem</span>
        </div>
        {/* Selected pin */}
        {hasPin && (
          <div
            className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
            style={pinPosition}
          >
            <span
              className={cn(
                'flex size-9 items-center justify-center rounded-full text-white shadow-xl',
                withinArea ? 'bg-primary' : 'bg-destructive',
              )}
            >
              <MapPin className="size-5" />
            </span>
          </div>
        )}
        {editable && (
          <p className="absolute right-2 bottom-2 rounded bg-black/40 px-2 py-1 text-[10px] text-white/80">
            Tap to place pin
          </p>
        )}
      </div>

      {hasPin && (
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium',
            withinArea ? 'bg-green-600/10 text-green-700' : 'bg-destructive/10 text-destructive',
          )}
        >
          <MapPin className="size-3.5 shrink-0" />
          {withinArea
            ? `Within our service area (${distanceKm.toFixed(1)} km from Ya Raheem)`
            : `Outside our ~${SERVICE_AREA.radiusKm} km service area (${distanceKm.toFixed(1)} km away) — delivery may not be available`}
        </div>
      )}
    </div>
  )
}
