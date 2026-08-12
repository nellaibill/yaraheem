import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bike, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DeliveryPartnerFormDialog } from '@/features/admin/components/DeliveryPartnerFormDialog'
import { fetchAdminDeliveryPartners, updateAdminDeliveryPartner } from '@/lib/api/adminDeliveryApi'
import { ApiError } from '@/lib/api/client'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { DeliveryPartnerDto, DeliveryPartnerStatus } from '@/lib/api/types'

const STATUS_LABELS: Record<DeliveryPartnerStatus, string> = {
  1: 'Available',
  2: 'On Delivery',
  3: 'Offline',
}

const STATUS_BADGE_VARIANT: Record<DeliveryPartnerStatus, 'secondary' | 'gold' | 'outline'> = {
  1: 'secondary',
  2: 'gold',
  3: 'outline',
}

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

export default function AdminDeliveryPartnersPage() {
  useDocumentTitle('Delivery Partners')
  const [partners, setPartners] = useState<DeliveryPartnerDto[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchAdminDeliveryPartners()
      .then((result) => {
        if (!cancelled) setPartners(result)
      })
      .catch((error) => {
        if (!cancelled) toast.error('Could not load delivery partners', { description: errorMessage(error) })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [version])

  function refresh() {
    setVersion((v) => v + 1)
  }

  async function handleStatusChange(partner: DeliveryPartnerDto, status: DeliveryPartnerStatus) {
    try {
      await updateAdminDeliveryPartner(partner.id, {
        name: partner.name,
        phoneNumber: partner.phoneNumber,
        vehicleType: partner.vehicleType,
        status,
      })
      toast.success('Status updated')
      refresh()
    } catch (error) {
      toast.error('Could not update status', { description: errorMessage(error) })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Delivery Partners</h1>
          <p className="text-muted-foreground text-sm">{partners.length} partners on the roster</p>
        </div>
        <Button variant="gold" className="gap-1.5" onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Add Partner
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground py-12 text-center text-sm">Loading...</p>
      ) : partners.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">No delivery partners yet.</p>
      ) : (
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
                    <p className="text-muted-foreground text-xs">+91 {partner.phoneNumber}</p>
                  </div>
                  <Badge variant={STATUS_BADGE_VARIANT[partner.status]}>{STATUS_LABELS[partner.status]}</Badge>
                </div>

                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Bike className="size-3.5" />
                    {partner.vehicleType}
                  </span>
                  <span className="truncate">{partner.email}</span>
                </div>

                <Select
                  value={String(partner.status)}
                  onValueChange={(v) => handleStatusChange(partner, Number(v) as DeliveryPartnerStatus)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Available</SelectItem>
                    <SelectItem value="2">On Delivery</SelectItem>
                    <SelectItem value="3">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DeliveryPartnerFormDialog open={formOpen} onOpenChange={setFormOpen} onCreated={refresh} />
    </div>
  )
}
