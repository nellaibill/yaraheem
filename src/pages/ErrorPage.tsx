import { Link, useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
      <AlertTriangle className="text-destructive size-14" strokeWidth={1.5} />
      <div>
        <h1 className="font-display text-3xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm">{message}</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" className="gap-2" onClick={() => navigate(0)}>
          <RotateCcw className="size-4" />
          Reload
        </Button>
        <Button asChild variant="gold">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
