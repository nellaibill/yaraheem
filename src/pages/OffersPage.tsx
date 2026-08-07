import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, Tag, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/common/SectionHeading'
import { offers } from '@/features/offers/data/offersData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency } from '@/lib/utils'

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  useDocumentTitle('Offers')

  function handleCopy(code: string) {
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopiedCode(code)
    toast.success(`Coupon "${code}" copied — apply it at checkout`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Offers"
        title="Deals Worth Ordering For"
        description="Apply any of these coupon codes at checkout."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {offers.map((offer, index) => (
          <motion.div
            key={offer.code}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: (index % 2) * 0.05 }}
          >
            <Card className="from-maroon relative overflow-hidden bg-gradient-to-br to-[#3a0d18] text-white">
              <div className="bg-noise absolute inset-0 text-white/[0.05]" />
              <CardContent className="relative flex flex-col gap-3 p-6">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-white/60 uppercase">
                  <Tag className="size-3.5" />
                  Limited time
                </div>
                <h3 className="font-display text-xl font-bold">{offer.title}</h3>
                <p className="text-sm text-white/75">{offer.description}</p>
                <p className="text-xs text-white/50">
                  Min order {formatCurrency(offer.minOrder)} · Valid till{' '}
                  {new Date(offer.expiresOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <div className="mt-2 flex items-center justify-between rounded-lg border border-dashed border-white/30 bg-white/5 px-4 py-2.5">
                  <span className="font-mono text-sm font-bold tracking-wider">{offer.code}</span>
                  <Button
                    size="sm"
                    variant="gold"
                    className="h-7 gap-1.5 px-2.5 text-xs"
                    onClick={() => handleCopy(offer.code)}
                  >
                    {copiedCode === offer.code ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copiedCode === offer.code ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
