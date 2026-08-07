import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, MapPin, Phone, Clock } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { Separator } from '@/components/ui/separator'
import { FOOTER_LINKS, NAV_LINKS, SITE, STAFF_LINKS } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-24">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="md:col-span-2 lg:col-span-1">
            <Logo variant="inverted" />
            <p className="text-primary-foreground/70 mt-4 max-w-xs text-sm leading-relaxed">
              {SITE.description}
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 flex size-9 items-center justify-center rounded-full transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href={SITE.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 flex size-9 items-center justify-center rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="size-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display mb-4 text-sm font-semibold tracking-wide uppercase">Explore</h3>
            <ul className="space-y-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-primary-foreground/75 hover:text-primary-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display mb-4 text-sm font-semibold tracking-wide uppercase">More</h3>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-primary-foreground/75 hover:text-primary-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display mb-4 text-sm font-semibold tracking-wide uppercase">Contact</h3>
            <ul className="text-primary-foreground/75 space-y-3 text-sm">
              <li className="flex gap-2">
                <MapPin className="size-4 shrink-0 translate-y-0.5" />
                <span>{SITE.address}</span>
              </li>
              <li className="flex gap-2">
                <Phone className="size-4 shrink-0 translate-y-0.5" />
                <a href={`tel:${SITE.phone}`}>{SITE.phone}</a>
              </li>
              <li className="flex gap-2">
                <Mail className="size-4 shrink-0 translate-y-0.5" />
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display mb-4 text-sm font-semibold tracking-wide uppercase">Hours</h3>
            <div className="text-primary-foreground/75 flex gap-2 text-sm">
              <Clock className="size-4 shrink-0 translate-y-0.5" />
              <span>{SITE.hours}</span>
            </div>
          </div>
        </div>

        <Separator className="bg-primary-foreground/15 my-10" />

        <div className="text-primary-foreground/60 flex flex-col items-center justify-between gap-3 text-xs sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {STAFF_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-primary-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
