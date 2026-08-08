import { MessageCircle } from 'lucide-react'
import { SITE } from '@/lib/constants'

export function WhatsAppButton() {
  const message = encodeURIComponent("Hello Yaraheem Catering, I'd like to know more about your services.")

  return (
    <a
      href={`https://wa.me/${SITE.whatsapp}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed right-4 bottom-24 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 lg:right-5 lg:bottom-5"
    >
      <MessageCircle className="size-6" fill="white" />
    </a>
  )
}
