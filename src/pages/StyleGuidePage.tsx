import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Bell, Check, ChefHat, Heart, Info, Soup, Star, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { SectionHeading } from '@/components/common/SectionHeading'

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-16 w-full rounded-lg border ${className}`} />
      <span className="text-muted-foreground text-xs">{name}</span>
    </div>
  )
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b py-12 first:pt-0 last:border-b-0">
      <h2 className="font-display mb-6 text-2xl font-bold">{title}</h2>
      {children}
    </div>
  )
}

export default function StyleGuidePage() {
  const [progress] = useState(64)

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Internal Reference"
        title="Yaraheem Design System"
        description="Live tokens and components. See docs/DESIGN_SYSTEM.md for the full written spec."
        align="left"
      />

      <div className="mt-12">
        <Block title="Typography">
          <div className="space-y-3">
            <p className="font-display text-5xl font-bold">Royal Biryani</p>
            <p className="font-display text-3xl font-semibold">Section Heading</p>
            <p className="font-display text-xl font-semibold">Card Title</p>
            <p className="text-base">Body text set in Poppins — used for all UI copy and descriptions.</p>
            <p className="text-muted-foreground text-sm">Muted small text for meta and captions.</p>
          </div>
        </Block>

        <Block title="Color Palette">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            <Swatch name="primary" className="bg-primary" />
            <Swatch name="secondary" className="bg-secondary" />
            <Swatch name="gold / accent" className="bg-gold" />
            <Swatch name="maroon" className="bg-maroon" />
            <Swatch name="muted" className="bg-muted" />
            <Swatch name="destructive" className="bg-destructive" />
            <Swatch name="background" className="bg-background" />
            <Swatch name="card" className="bg-card" />
          </div>
        </Block>

        <Block title="Border Radius">
          <div className="flex flex-wrap gap-6">
            {['rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full'].map(
              (r) => (
                <div key={r} className="flex flex-col items-center gap-2">
                  <div className={`bg-primary size-16 ${r}`} />
                  <span className="text-muted-foreground text-xs">{r}</span>
                </div>
              ),
            )}
          </div>
        </Block>

        <Block title="Shadow System">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-5">
            {['shadow-xs', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl'].map((s) => (
              <div key={s} className="flex flex-col items-center gap-3">
                <div className={`bg-card size-16 rounded-lg ${s}`} />
                <span className="text-muted-foreground text-xs">{s}</span>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button variant="gold">Gold</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="icon" aria-label="Icon button">
              <Heart />
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </Block>

        <Block title="Cards">
          <div className="grid gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Simple Card</CardTitle>
                <CardDescription>Header, content and footer slots.</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Cards use a warm-tinted shadow and 12px radius by default.
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">
                  Action
                </Button>
              </CardFooter>
            </Card>
            <Card className="border-gold ring-gold/40 ring-2">
              <CardHeader>
                <CardTitle>Highlighted</CardTitle>
                <CardDescription>Used for "most popular" states.</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="gold">Featured</Badge>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Hover Lift</CardTitle>
                <CardDescription>Shadow increases on hover.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </Block>

        <Block title="Input Fields">
          <div className="grid max-w-xl gap-5">
            <div className="grid gap-1.5">
              <Label htmlFor="sg-input">Text input</Label>
              <Input id="sg-input" placeholder="Your name" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="sg-textarea">Textarea</Label>
              <Textarea id="sg-textarea" placeholder="Message" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="sg-checkbox" />
              <Label htmlFor="sg-checkbox">Checkbox label</Label>
            </div>
            <RadioGroup defaultValue="a" className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="a" id="sg-radio-a" />
                <Label htmlFor="sg-radio-a">Option A</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="b" id="sg-radio-b" />
                <Label htmlFor="sg-radio-b">Option B</Label>
              </div>
            </RadioGroup>
            <div className="flex items-center gap-2">
              <Switch id="sg-switch" />
              <Label htmlFor="sg-switch">Switch label</Label>
            </div>
          </div>
        </Block>

        <Block title="Badges">
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="gold">Signature</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Sold Out</Badge>
          </div>
        </Block>

        <Block title="Icons">
          <div className="flex flex-wrap gap-6">
            {[ChefHat, Soup, Star, Heart, Bell, Info].map((Icon, i) => (
              <Icon key={i} className="text-primary size-6" strokeWidth={1.5} />
            ))}
          </div>
        </Block>

        <Block title="Toast Design">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => toast.success('Order placed successfully!')}>
              Success Toast
            </Button>
            <Button variant="outline" onClick={() => toast.error('Something went wrong.')}>
              Error Toast
            </Button>
            <Button variant="outline" onClick={() => toast('Just a heads up.')}>
              Neutral Toast
            </Button>
          </div>
        </Block>

        <Block title="Modal Design">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Modal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogDescription>This is the standard modal treatment across the app.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="gold">Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Block>

        <Block title="Loading Skeleton">
          <div className="flex max-w-sm flex-col gap-3">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Block>

        <Block title="Avatar, Progress, Alert & Tooltip">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex gap-3">
              <Avatar>
                <AvatarFallback>YR</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback className="bg-gold text-gold-foreground">AK</AvatarFallback>
              </Avatar>
            </div>
            <div className="w-48">
              <Progress value={progress} />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  Hover me
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip content</TooltipContent>
            </Tooltip>
          </div>
          <div className="mt-6 grid max-w-xl gap-3">
            <Alert variant="success">
              <Check />
              <AlertTitle>Order Confirmed</AlertTitle>
              <AlertDescription>Your order has been placed successfully.</AlertDescription>
            </Alert>
            <Alert variant="warning">
              <TriangleAlert />
              <AlertTitle>Delivery Delay</AlertTitle>
              <AlertDescription>Your order may arrive 10 minutes later than expected.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <Info />
              <AlertTitle>Payment Failed</AlertTitle>
              <AlertDescription>Please try another payment method.</AlertDescription>
            </Alert>
          </div>
        </Block>

        <div className="pt-4">
          <Separator className="mb-6" />
          <p className="text-muted-foreground text-center text-xs">
            Dark mode ready · Mobile-first responsive · See{' '}
            <code className="bg-muted rounded px-1.5 py-0.5">docs/DESIGN_SYSTEM.md</code>
          </p>
        </div>
      </div>
    </div>
  )
}
