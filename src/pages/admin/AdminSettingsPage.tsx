import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { DEFAULT_PROMO_BANNER, DEFAULT_RESTAURANT_SETTINGS, MENU_SECTION_LABELS, STORAGE_KEYS } from '@/lib/constants'
import { resetDemoData } from '@/lib/api/adminDemoApi'
import { ApiError } from '@/lib/api/client'
import type { MenuSectionKey, PromoBanner, RestaurantSettings } from '@/types'

const SECTION_OPTIONS = Object.keys(MENU_SECTION_LABELS) as MenuSectionKey[]

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useLocalStorage<RestaurantSettings>(
    STORAGE_KEYS.restaurantSettings,
    DEFAULT_RESTAURANT_SETTINGS,
  )
  const [banner, setBanner] = useLocalStorage<PromoBanner>(STORAGE_KEYS.promoBanner, DEFAULT_PROMO_BANNER)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [resetting, setResetting] = useState(false)

  async function handleResetDemoData() {
    setResetting(true)
    try {
      await resetDemoData()
      toast.success('Demo data reset', { description: 'Orders, dine-in, and delivery data now show a fresh curated demo.' })
      setConfirmingReset(false)
    } catch (error) {
      toast.error('Could not reset demo data', { description: errorMessage(error) })
    } finally {
      setResetting(false)
    }
  }

  function update<K extends keyof RestaurantSettings>(key: K, value: RestaurantSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function updateBanner<K extends keyof PromoBanner>(key: K, value: PromoBanner[K]) {
    setBanner((prev) => ({ ...prev, [key]: value }))
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
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium">Offers &amp; Coupons</p>
            <p className="text-muted-foreground text-xs">Turn off to hide the Offers page and coupon field at checkout</p>
          </div>
          <Switch checked={settings.offersEnabled} onCheckedChange={(v) => update('offersEnabled', v)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-medium">Today&rsquo;s Special</p>
            <p className="text-muted-foreground text-xs">Which menu section is featured as today&rsquo;s special on the homepage</p>
          </div>
          <Select
            value={settings.todaysSpecialKey}
            onValueChange={(v) => update('todaysSpecialKey', v as MenuSectionKey)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTION_OPTIONS.map((key) => (
                <SelectItem key={key} value={key}>
                  {MENU_SECTION_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Promotional Banner</p>
              <p className="text-muted-foreground text-xs">Shown as the highlighted strip on the homepage</p>
            </div>
            <Switch checked={banner.enabled} onCheckedChange={(v) => updateBanner('enabled', v)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="banner-title">Title</Label>
            <Input id="banner-title" value={banner.title} onChange={(e) => updateBanner('title', e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="banner-description">Description</Label>
            <Input
              id="banner-description"
              value={banner.description}
              onChange={(e) => updateBanner('description', e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="banner-code">Coupon Code (optional)</Label>
            <Input
              id="banner-code"
              value={banner.code ?? ''}
              onChange={(e) => updateBanner('code', e.target.value.toUpperCase())}
              placeholder="e.g. WEEKEND15"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-5 p-5">
          <div className="grid gap-1.5">
            <Label htmlFor="min-order">Minimum Order Value (Rs.)</Label>
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

      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-medium">Demo Data</p>
            <p className="text-muted-foreground text-xs">
              Wipes orders, dine-in sessions, and delivery assignments, then reseeds a fresh curated demo — run this right
              before showing the app to someone.
            </p>
          </div>
          <Button variant="destructive" className="shrink-0" onClick={() => setConfirmingReset(true)}>
            Reset Demo Data
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmingReset} onOpenChange={(open) => !resetting && setConfirmingReset(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset demo data?</DialogTitle>
            <DialogDescription>
              This permanently deletes every order, dine-in session, and delivery assignment, then reseeds a fresh curated
              demo dataset. Product catalog and accounts are untouched. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmingReset(false)} disabled={resetting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetDemoData} disabled={resetting}>
              {resetting ? 'Resetting...' : 'Reset Demo Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
