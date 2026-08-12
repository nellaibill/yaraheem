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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AdminMenuItem } from '@/features/menu/lib/adminMenuMapping'
import type { CategoryDto } from '@/lib/api/types'

export interface MenuItemFormValues {
  name: string
  slug: string
  categoryId: string
  price: number
  comparePrice?: number
  thumbnailUrl?: string
  isFeatured: boolean
  isPublished: boolean
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function emptyForm(defaultCategoryId: string): MenuItemFormValues {
  return { name: '', slug: '', categoryId: defaultCategoryId, price: 0, isFeatured: false, isPublished: true }
}

export function MenuItemFormDialog({
  open,
  onOpenChange,
  item,
  categories,
  existingSlugs,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: AdminMenuItem | null
  categories: CategoryDto[]
  existingSlugs: string[]
  onSave: (values: MenuItemFormValues, editing: AdminMenuItem | null) => Promise<void>
}) {
  const [form, setForm] = useState<MenuItemFormValues>(emptyForm(categories[0]?.id ?? ''))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        item
          ? {
              name: item.name,
              slug: item.id,
              categoryId: item.categoryId,
              price: item.price,
              comparePrice: item.originalPrice,
              thumbnailUrl: item.imageUrl,
              isFeatured: item.isSignature ?? false,
              isPublished: item.isAvailable !== false,
            }
          : emptyForm(categories[0]?.id ?? ''),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- categories is only read at open-time by design
  }, [open, item])

  function update<K extends keyof MenuItemFormValues>(key: K, value: MenuItemFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (form.price <= 0) {
      toast.error('Price must be greater than 0')
      return
    }
    if (!form.categoryId) {
      toast.error('Category is required')
      return
    }

    let slug = item?.id ?? ''
    if (!item) {
      const base = slugify(form.name) || 'menu-item'
      slug = base
      let counter = 2
      while (existingSlugs.includes(slug)) {
        slug = `${base}-${counter}`
        counter++
      }
    }

    setSubmitting(true)
    try {
      await onSave({ ...form, slug }, item)
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
          <DialogDescription>Changes save directly to the live catalog.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="item-name">Name</Label>
            <Input id="item-name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
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
              <Label htmlFor="item-original-price">Compare-at Price</Label>
              <Input
                id="item-original-price"
                type="number"
                min={0}
                value={form.comparePrice ?? ''}
                onChange={(e) => update('comparePrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Optional — shown struck-through"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Category</Label>
            <Select value={form.categoryId} onValueChange={(v) => update('categoryId', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="item-image">Image URL</Label>
            <Input
              id="item-image"
              value={form.thumbnailUrl ?? ''}
              onChange={(e) => update('thumbnailUrl', e.target.value || undefined)}
              placeholder="Leave blank to use the default catalog photo"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
              <Label htmlFor="item-featured" className="text-xs font-normal">
                Featured
              </Label>
              <Switch id="item-featured" checked={form.isFeatured} onCheckedChange={(v) => update('isFeatured', v)} />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
              <Label htmlFor="item-published" className="text-xs font-normal">
                Available
              </Label>
              <Switch id="item-published" checked={form.isPublished} onCheckedChange={(v) => update('isPublished', v)} />
            </div>
          </div>

          {item && (
            <div className="bg-muted/40 grid gap-1.5 rounded-lg border border-dashed p-3">
              <p className="text-muted-foreground text-xs font-medium">
                Spice level, veg flag, signature/bestseller tags, combo contents and sections are set at launch and
                aren&rsquo;t editable here yet.
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-[10px] capitalize">
                  {item.spiceLevel}
                </Badge>
                {item.isVeg && (
                  <Badge variant="outline" className="text-[10px] text-green-700">
                    Veg
                  </Badge>
                )}
                {item.isSignature && (
                  <Badge variant="gold" className="text-[10px]">
                    Signature
                  </Badge>
                )}
                {item.isBestSeller && <Badge className="text-[10px]">Bestseller</Badge>}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" variant="gold" className="w-full sm:w-auto" disabled={submitting}>
              {submitting ? 'Saving…' : item ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
