import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount)
  return `Rs. ${formatted}`
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function hashSeed(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return hash
}

/** Deterministic mock rating derived from an id — same item always shows the same rating. */
export function getMockRating(seed: string): { average: number; count: number } {
  const hash = hashSeed(seed)
  const average = Math.round((3.9 + (hash % 100) / 100) * 10) / 10
  const count = 40 + (hash % 260)
  return { average: Math.min(average, 5), count }
}
