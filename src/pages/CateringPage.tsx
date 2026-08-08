import { useState } from 'react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { CateringPackageCard } from '@/features/catering/components/CateringPackageCard'
import { InquiryDialog } from '@/features/catering/components/InquiryDialog'
import { cateringPackages } from '@/features/catering/data/cateringData'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { CateringPackage } from '@/types'

const FAQS = [
  {
    question: 'How far in advance should I book?',
    answer:
      'We recommend booking at least 2 weeks ahead for events under 100 guests, and 4-6 weeks for weddings or events above 200 guests to guarantee your date.',
  },
  {
    question: 'Can I customize a package?',
    answer:
      'Absolutely. Every package is a starting point — swap dishes, add live counters, or scale portions. Mention your preferences in the inquiry form.',
  },
  {
    question: 'Do you cater outside Tirunelveli?',
    answer:
      'Yes, we service Tirunelveli, Thoothukudi, Tenkasi, Madurai, Kanyakumari, Ramanathapuram, Virudhunagar, and nearby districts for larger events. Share your location in the inquiry and we will confirm feasibility.',
  },
  {
    question: 'Is a deposit required?',
    answer:
      'A 30% advance confirms your booking date, with the balance due on the event day. Our team will share full payment terms during the consultation call.',
  },
]

export default function CateringPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>(undefined)
  useDocumentTitle('Catering')

  function handleEnquire(pkg: CateringPackage) {
    setSelectedPackageId(pkg.id)
    setDialogOpen(true)
  }

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Catering Services"
          title="Packages for Every Occasion"
          description="Transparent per-plate pricing, full-service staffing, and menus tailored to your celebration."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cateringPackages.map((pkg) => (
            <CateringPackageCard key={pkg.id} pkg={pkg} onEnquire={handleEnquire} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-muted-foreground mb-4 text-sm">Have a custom guest count or menu in mind?</p>
          <Button
            variant="gold"
            size="lg"
            onClick={() => {
              setSelectedPackageId(undefined)
              setDialogOpen(true)
            }}
          >
            Request a Custom Quote
          </Button>
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" />
          <Accordion type="single" collapsible className="mt-10">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <InquiryDialog open={dialogOpen} onOpenChange={setDialogOpen} packageId={selectedPackageId} />
    </div>
  )
}
