import { Loader2 } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="text-primary size-8 animate-spin" />
    </div>
  )
}
