import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MENU_CATEGORY_LABELS } from '@/features/menu/data/menuData'
import { MENU_SECTION_LABELS } from '@/lib/constants'
import type { MenuCategory, MenuItem, MenuSectionKey, SpiceLevel } from '@/types'

const CATEGORY_OPTIONS = Object.keys(MENU_CATEGORY_LABELS) as MenuCategory[]
const SECTION_OPTIONS = Object.keys(MENU_SECTION_LABELS) as MenuSectionKey[]
const SPICE_OPTIONS: SpiceLevel[] = ['mild', 'medium', 'spicy']

function emptyItem(): MenuItem {
  return {
    id: '',
    name: '',
    description: '',
    price: 0,
    category: 'biryani',
    spiceLevel: 'medium',
    isVeg: false,
    isSignature: false,
    isBestSeller: false,
    isAvailable: true,
    sections: [],
  }
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function MenuItemFormDialog({
  open,
  onOpenChange,
  item,
  defaultSections,
  existingIds,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: MenuItem | null
  /** Pre-checked sections for a brand-new item (e.g. from a dashboard Quick Action) — ignored when editing. */
  defaultSections?: MenuSectionKey[]
  existingIds: string[]
  onSave: (item: MenuItem) => void
}) {
  const [form, setForm] = useState<MenuItem>(item ?? emptyItem())
  const [comboSlotsText, setComboSlotsText] = useState(item?.comboSlots?.join('\n') ?? '')

  useEffect(() => {
    if (open) {
      setForm(item ?? { ...emptyItem(), sections: defaultSections?.length ? [...defaultSections] : [] })
      setComboSlotsText(item?.comboSlots?.join('\n') ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- defaultSections is only read at open-time by design
  }, [open, item])

  function update<K extends keyof MenuItem>(key: K, value: MenuItem[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleSection(key: MenuSectionKey, checked: boolean) {
    setForm((prev) => {
      const current = prev.sections ?? []
      const next = checked ? [...current, key] : current.filter((s) => s !== key)
      return { ...prev, sections: next }
    })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (form.price <= 0) {
      toast.error('Price must be greater than 0')
      return
    }

    let id = item?.id
    if (!id) {
      const base = slugify(form.name) || 'menu-item'
      id = base
      let counter = 2
      while (existingIds.includes(id)) {
        id = `${base}-${counter}`
        counter++
      }
    }

    const comboSlots = comboSlotsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    onSave({ ...form, id, comboSlots: comboSlots.length > 0 ? comboSlots : undefined })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
          <DialogDescription>Changes save to this browser&rsquo;s catalog immediately.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="item-name">Name</Label>
            <Input id="item-name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="item-description">Description</Label>
            <Textarea
              id="item-description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="item-price">Price (Rs.)</Label>
              <Input
                id="item-price"
                type="number"
                min={0}
                value={form.price || ''}
                onChange={(e) => update('price', Number(e.target.value))}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="item-original-price">Original Price</Label>
              <Input
                id="item-original-price"
                type="number"
                min={0}
                value={form.originalPrice ?? ''}
                onChange={(e) => update('originalPrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Optional — shown struck-through"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => update('category', v as MenuCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((category) => (
                    <SelectItem key={category} value={category}>
                      {MENU_CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Spice Level</Label>
              <Select value={form.spiceLevel} onValueChange={(v) => update('spiceLevel', v as SpiceLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPICE_OPTIONS.map((spice) => (
                    <SelectItem key={spice} value={spice} className="capitalize">
                      {spice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="item-image">Image URL</Label>
            <Input
              id="item-image"
              value={form.imageUrl ?? ''}
              onChange={(e) => update('imageUrl', e.target.value || undefined)}
              placeholder="Leave blank to use the default catalog photo"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="item-combo-slots">Combo Slots</Label>
            <Textarea
              id="item-combo-slots"
              value={comboSlotsText}
              onChange={(e) => setComboSlotsText(e.target.value)}
              placeholder={'One per line, e.g.\n1 Bucket Biryani (serves 4)\n1 Chicken 65 (full)'}
            />
          </div>
          <div className="grid gap-2">
            <Label>Available In</Label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {SECTION_OPTIONS.map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    id={`section-${key}`}
                    checked={form.sections?.includes(key) ?? false}
                    onCheckedChange={(checked) => toggleSection(key, checked === true)}
                  />
                  <Label htmlFor={`section-${key}`} className="text-xs font-normal">
                    {MENU_SECTION_LABELS[key]}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
              <Label htmlFor="item-veg" className="text-xs font-normal">
                Veg
              </Label>
              <Switch id="item-veg" checked={form.isVeg} onCheckedChange={(v) => update('isVeg', v)} />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
              <Label htmlFor="item-signature" className="text-xs font-normal">
                Signature
              </Label>
              <Switch
                id="item-signature"
                checked={form.isSignature ?? false}
                onCheckedChange={(v) => update('isSignature', v)}
              />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
              <Label htmlFor="item-bestseller" className="text-xs font-normal">
                Bestseller
              </Label>
              <Switch
                id="item-bestseller"
                checked={form.isBestSeller ?? false}
                onCheckedChange={(v) => update('isBestSeller', v)}
              />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
              <Label htmlFor="item-available" className="text-xs font-normal">
                Available
              </Label>
              <Switch
                id="item-available"
                checked={form.isAvailable !== false}
                onCheckedChange={(v) => update('isAvailable', v)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" variant="gold" className="w-full sm:w-auto">
              {item ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
