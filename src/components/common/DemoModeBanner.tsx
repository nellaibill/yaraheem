export function DemoModeBanner() {
  if (import.meta.env.VITE_DEMO_MODE !== 'true') return null

  return (
    <div className="bg-primary px-4 py-1.5 text-center text-xs font-medium text-primary-foreground">
      Demo Mode — every screen runs on sample data in your browser only. No real orders, payments,
      or messages are sent.
    </div>
  )
}
