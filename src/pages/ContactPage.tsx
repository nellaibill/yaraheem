import { Mail, MapPin, Phone, Clock } from 'lucide-react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Card, CardContent } from '@/components/ui/card'
import { ContactForm } from '@/features/contact/components/ContactForm'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { SITE } from '@/lib/constants'

const CONTACT_DETAILS = [
  { icon: MapPin, label: 'Address', value: SITE.address },
  { icon: Phone, label: 'Phone', value: SITE.phone },
  { icon: Mail, label: 'Email', value: SITE.email },
  { icon: Clock, label: 'Hours', value: SITE.hours },
]

export default function ContactPage() {
  useDocumentTitle('Contact')

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Get in Touch"
        title="We'd Love to Hear From You"
        description="Questions about catering, menus, or a custom event? Send us a message or reach out directly."
      />

      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {CONTACT_DETAILS.map((detail) => (
            <Card key={detail.label}>
              <CardContent className="flex items-start gap-4 p-5">
                <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
                  <detail.icon className="size-4.5" />
                </span>
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {detail.label}
                  </p>
                  <p className="text-sm font-medium">{detail.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="lg:col-span-3">
          <CardContent className="p-6 sm:p-8">
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
