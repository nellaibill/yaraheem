import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Bell,
  Check,
  Heart,
  LogOut,
  MapPin,
  Moon,
  Pencil,
  Plus,
  Receipt,
  ShoppingBag,
  Sun,
  Tag,
  Trash2,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/common/EmptyState'
import { MenuCard } from '@/features/menu/components/MenuCard'
import { AddressFormDialog } from '@/features/checkout/components/AddressFormDialog'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAddresses } from '@/features/checkout/hooks/useAddresses'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { useTheme } from '@/hooks/useTheme'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMenuData } from '@/features/menu/hooks/useMenuData'
import { ORDER_STATUS_META } from '@/features/tracking/lib/backendOrderStatus'
import { ensureBackendSession } from '@/lib/api/authBridge'
import { fetchMyOrders } from '@/lib/api/ordersApi'
import type { OrderDto } from '@/lib/api/types'
import { formatCurrency } from '@/lib/utils'
import type { Address } from '@/types'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function ProfilePage() {
  const { user, updateName, logout } = useAuth()
  const { addresses, addAddress, removeAddress, setDefaultAddress } = useAddresses()
  const { favoriteIds } = useFavorites()
  const { theme, setTheme } = useTheme()
  const { items: menuItems } = useMenuData()
  const navigate = useNavigate()
  useDocumentTitle('Your Profile')

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(user?.name ?? '')
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [orderUpdates, setOrderUpdates] = useState(true)
  const [promotions, setPromotions] = useState(false)
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ensureBackendSession(user.mobile, user.name)
      .then(() => fetchMyOrders(1, 50))
      .then((result) => {
        if (!cancelled) setOrders(result.items)
      })
      .catch((error) => console.error('Failed to load order history.', error))
      .finally(() => {
        if (!cancelled) setOrdersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) return null

  const favoriteItems = menuItems.filter((item) => favoriteIds.includes(item.id))

  function handleSaveName() {
    if (nameDraft.trim()) updateName(nameDraft.trim())
    setEditingName(false)
  }

  function handleAddAddress(address: Omit<Address, 'id'>) {
    addAddress(address)
  }

  function handleLogout() {
    logout()
    toast.success('Logged out successfully')
    navigate('/splash', { replace: true })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Card className="mb-8">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="h-9 max-w-48"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveName}>
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="font-display text-xl font-bold">{user.name}</h1>
                <button
                  onClick={() => {
                    setNameDraft(user.name)
                    setEditingName(true)
                  }}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Edit name"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
            )}
            <p className="text-muted-foreground text-sm">+91 {user.mobile}</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleLogout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="orders">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="orders">
            <Receipt className="size-4" /> Orders
          </TabsTrigger>
          <TabsTrigger value="addresses">
            <MapPin className="size-4" /> Addresses
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="size-4" /> Favorites
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Bell className="size-4" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          {ordersLoading ? (
            <p className="text-muted-foreground py-12 text-center text-sm">Loading your orders...</p>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders yet"
              description="Your past orders will show up here."
              actionLabel="Browse Menu"
              actionTo="/menu"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <Link key={order.id} to={`/orders/${order.id}`}>
                  <Card className="hover:bg-secondary/30 transition-colors">
                    <CardContent className="flex items-center justify-between gap-4 p-4">
                      <div>
                        <p className="text-sm font-semibold">Order #{order.orderNumber}</p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          · {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={order.status === 5 ? 'secondary' : 'gold'}>
                          {ORDER_STATUS_META[order.status].label}
                        </Badge>
                        <span className="text-sm font-semibold">{formatCurrency(order.total)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <div className="mb-4 flex justify-end">
            <Button size="sm" className="gap-1.5" onClick={() => setAddressDialogOpen(true)}>
              <Plus className="size-3.5" />
              Add Address
            </Button>
          </div>
          {addresses.length === 0 ? (
            <EmptyState icon={MapPin} title="No saved addresses" description="Add an address for faster checkout." />
          ) : (
            <div className="flex flex-col gap-3">
              {addresses.map((address) => (
                <Card key={address.id}>
                  <CardContent className="flex items-start justify-between gap-4 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{address.label}</p>
                        {address.isDefault && <Badge variant="gold">Default</Badge>}
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} -{' '}
                        {address.pincode}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!address.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label="Set as default"
                          onClick={() => setDefaultAddress(address.id)}
                        >
                          <Check className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive size-8"
                        aria-label="Remove address"
                        onClick={() => removeAddress(address.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          {favoriteItems.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No favorites yet"
              description="Tap the heart on any dish to save it here."
              actionLabel="Browse Menu"
              actionTo="/menu"
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {favoriteItems.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="size-4.5" /> : <Sun className="size-4.5" />}
                  <div>
                    <p className="text-sm font-medium">Dark Mode</p>
                    <p className="text-muted-foreground text-xs">Switch between light and dark themes</p>
                  </div>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <Bell className="size-4.5" />
                  <div>
                    <p className="text-sm font-medium">Order Updates</p>
                    <p className="text-muted-foreground text-xs">Get notified about order status changes</p>
                  </div>
                </div>
                <Switch checked={orderUpdates} onCheckedChange={setOrderUpdates} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <Tag className="size-4.5" />
                  <div>
                    <p className="text-sm font-medium">Promotional Offers</p>
                    <p className="text-muted-foreground text-xs">Receive news about deals and offers</p>
                  </div>
                </div>
                <Switch checked={promotions} onCheckedChange={setPromotions} />
              </CardContent>
            </Card>
            <Separator />
            <Button variant="outline" className="w-full gap-2 sm:w-fit" onClick={handleLogout}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <AddressFormDialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen} onSave={handleAddAddress} />
    </div>
  )
}
