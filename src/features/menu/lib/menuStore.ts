import { readStorage, writeStorage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { menuItems as baseMenuItems, menuSections as baseMenuSections } from '@/features/menu/data/menuData'
import type { MenuItem, MenuSection } from '@/types'

/**
 * Admin edits are stored as a full working copy in localStorage, separate from the
 * static seed data in menuData.ts. Until the admin edits anything, every reader falls
 * back to the seed data — so the catalog works out of the box with zero setup.
 */
export function getMenuItems(): MenuItem[] {
  return readStorage(STORAGE_KEYS.menuItemsOverride, baseMenuItems)
}

export function saveMenuItems(items: MenuItem[]) {
  writeStorage(STORAGE_KEYS.menuItemsOverride, items)
}

export function getMenuSections(): MenuSection[] {
  return readStorage(STORAGE_KEYS.menuSectionsOverride, baseMenuSections)
}

export function saveMenuSections(sections: MenuSection[]) {
  writeStorage(STORAGE_KEYS.menuSectionsOverride, sections)
}

export function upsertMenuItem(item: MenuItem): MenuItem[] {
  const items = getMenuItems()
  const idx = items.findIndex((i) => i.id === item.id)
  const next = idx === -1 ? [...items, item] : items.map((i, index) => (index === idx ? item : i))
  saveMenuItems(next)
  return next
}

export function deleteMenuItem(itemId: string): MenuItem[] {
  const next = getMenuItems().filter((i) => i.id !== itemId)
  saveMenuItems(next)
  return next
}

export function upsertMenuSection(section: MenuSection): MenuSection[] {
  const sections = getMenuSections()
  const idx = sections.findIndex((s) => s.key === section.key)
  const next = idx === -1 ? [...sections, section] : sections.map((s, index) => (index === idx ? section : s))
  saveMenuSections(next)
  return next
}
