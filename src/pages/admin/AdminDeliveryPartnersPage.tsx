import { Bike, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDeliveryPartners } from '@/features/delivery/hooks/useDeliveryPartners'
import { DELIVERY_PARTNER_STATUS_LABELS } from '@/lib/constants'
import type { DeliveryPartnerStatus } from '@/types'

const STATUS_BADGE_VARIANT: Record<DeliveryPartnerStatus, 'secondary' | 'gold' | 'outline'> = {
  available: 'secondary',
  busy: 'gold',
  offline: 'outline',
}

export default function AdminDeliveryPartnersPage() {
  const { partners, updateStatus } = useDeliveryPartners()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Delivery Partners</h1>
        <p className="text-muted-foreground text-sm">{partners.length} partners on the roster</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((partner) => (
          <Card key={partner.id}>
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {partner.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{partner.name}</p>
                  <p className="text-muted-foreground text-xs">+91 {partner.mobile}</p>
                </div>
                <Badge variant={STATUS_BADGE_VARIANT[partner.status]}>
                  {DELIVERY_PARTNER_STATUS_LABELS[partner.status]}
                </Badge>
              </div>

              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 capitalize">
                  <Bike className="size-3.5" />
                  {partner.vehicleType}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="fill-gold text-gold size-3.5" />
                  {partner.rating}
                </span>
                <span>{partner.totalDeliveries} deliveries</span>
              </div>

              {partner.activeOrderId && (
                <p className="text-muted-foreground text-xs">
                  On order #{partner.activeOrderId.slice(0, 8).toUpperCase()}
                </p>
              )}

              <Select
                value={partner.status}
                onValueChange={(v) => updateStatus(partner.id, v as DeliveryPartnerStatus)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">On Delivery</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
