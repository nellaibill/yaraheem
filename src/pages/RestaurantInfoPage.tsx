import { Clock, MapPin, Phone, Mail, ShieldCheck, Truck, Star } from 'lucide-react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { SITE } from '@/lib/constants'

const INFO_ROWS = [
  { icon: MapPin, label: 'Address', value: SITE.address },
  { icon: Clock, label: 'Operating Hours', value: SITE.hours },
  { icon: Phone, label: 'Phone', value: SITE.phone },
  { icon: Mail, label: 'Email', value: SITE.email },
  { icon: Truck, label: 'Delivery Radius', value: 'Up to 12 km from our Tirunelveli kitchen' },
  { icon: ShieldCheck, label: 'FSSAI License', value: '12345678901234 (mock, for demo purposes)' },
]

export default function RestaurantInfoPage() {
  useDocumentTitle('Restaurant Info')

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Restaurant Info"
        title="Everything About Yaraheem"
        description="Operational details, licensing, and how to reach us."
      />

      <Card className="mt-12">
        <CardContent className="divide-y p-0">
          {INFO_ROWS.map((row) => (
            <div key={row.label} className="flex items-start gap-4 p-5">
              <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
                <row.icon className="size-4.5" />
              </span>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{row.label}</p>
                <p className="text-sm font-medium">{row.value}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="bg-secondary/40 mt-8 flex items-center justify-center gap-3 rounded-2xl border border-dashed p-10 text-center">
        <div>
          <MapPin className="text-muted-foreground mx-auto mb-2 size-8" />
          <p className="text-muted-foreground text-sm">Map preview (mock — no live map integration in this POC)</p>
        </div>
      </div>

      <Separator className="my-10" />

      <div className="flex items-center justify-center gap-2">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="fill-gold text-gold size-5" />
          ))}
        </div>
        <span className="text-muted-foreground text-sm">Rated 4.7 average across 1,200+ orders</span>
      </div>
    </div>
  )
}
