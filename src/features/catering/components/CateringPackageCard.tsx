import { motion } from 'framer-motion'
import { Check, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, cn } from '@/lib/utils'
import type { CateringPackage } from '@/types'

export function CateringPackageCard({
  pkg,
  onEnquire,
}: {
  pkg: CateringPackage
  onEnquire: (pkg: CateringPackage) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <Card
        className={cn(
          'relative flex h-full flex-col pt-6',
          pkg.isPopular && 'border-gold ring-gold/40 shadow-md ring-2',
        )}
      >
        {pkg.isPopular && (
          <Badge variant="gold" className="absolute -top-3 left-1/2 -translate-x-1/2">
            Most Popular
          </Badge>
        )}
        <CardHeader>
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Users className="size-3.5" />
            {pkg.guestsRange}
          </div>
          <CardTitle>{pkg.name}</CardTitle>
          <CardDescription>{pkg.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="mb-4">
            <span className="font-display text-3xl font-bold">{formatCurrency(pkg.pricePerPlate)}</span>
            <span className="text-muted-foreground text-sm"> / plate</span>
          </p>
          <ul className="space-y-2.5 text-sm">
            {pkg.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2">
                <Check className="text-gold mt-0.5 size-4 shrink-0" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            variant={pkg.isPopular ? 'gold' : 'outline'}
            onClick={() => onEnquire(pkg)}
          >
            Enquire Now
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
