import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground flex field-sizing-content min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors outline-none',
        'focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-2',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
