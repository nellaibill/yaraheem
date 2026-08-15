import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import '@/styles/globals.css'

async function bootstrap() {
  // Only ever true in the GitHub Pages build (set exclusively in .github/workflows/deploy.yml)
  // — this whole branch, and everything it imports, is dead-code-eliminated from the real
  // Docker/VM production bundle since Vite statically replaces import.meta.env.VITE_DEMO_MODE.
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    const { worker } = await import('@/mocks/browser')
    await worker.start({
      serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
      onUnhandledRequest: 'bypass',
    })
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
