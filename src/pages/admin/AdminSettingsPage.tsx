import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { DEFAULT_RESTAURANT_SETTINGS, STORAGE_KEYS } from '@/lib/constants'
import type { RestaurantSettings } from '@/types'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useLocalStorage<RestaurantSettings>(
    STORAGE_KEYS.restaurantSettings,
    DEFAULT_RESTAURANT_SETTINGS,
  )

  function update<K extends keyof RestaurantSettings>(key: K, value: RestaurantSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Restaurant operational configuration</p>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium">Accepting Orders</p>
            <p className="text-muted-foreground text-xs">Turn off to pause new orders site-wide</p>
          </div>
          <Switch
            checked={settings.acceptingOrders}
            onCheckedChange={(v) => update('acceptingOrders', v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-5 p-5">
          <div className="grid gap-1.5">
            <Label htmlFor="min-order">Minimum Order Value (₹)</Label>
            <Input
              id="min-order"
              type="number"
              value={settings.minOrderValue}
              onChange={(e) => update('minOrderValue', Number(e.target.value))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="delivery-radius">Delivery Radius (km)</Label>
            <Input
              id="delivery-radius"
              type="number"
              value={settings.deliveryRadiusKm}
              onChange={(e) => update('deliveryRadiusKm', Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="open-time">Opening Time</Label>
              <Input
                id="open-time"
                type="time"
                value={settings.openTime}
                onChange={(e) => update('openTime', e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="close-time">Closing Time</Label>
              <Input
                id="close-time"
                type="time"
                value={settings.closeTime}
                onChange={(e) => update('closeTime', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="gold"
        className="w-fit"
        onClick={() => toast.success('Settings saved')}
      >
        Save Changes
      </Button>
    </div>
  )
}
