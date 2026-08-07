import { Link } from 'react-router-dom'
import { ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-5 px-4 text-center">
      <ChefHat className="text-primary size-14" strokeWidth={1.5} />
      <h1 className="font-display text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">
        This page seems to have wandered off the buffet line. Let's get you back on track.
      </p>
      <Button asChild variant="gold" size="lg">
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  )
}
