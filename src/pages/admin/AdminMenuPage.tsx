import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FoodImage } from '@/components/common/FoodImage'
import { MenuItemFormDialog, type MenuItemFormValues } from '@/features/admin/components/MenuItemFormDialog'
import { useAdminMenuData } from '@/features/menu/hooks/useAdminMenuData'
import type { AdminMenuItem } from '@/features/menu/lib/adminMenuMapping'
import { deleteMenuItem, getMenuSections, upsertMenuSection } from '@/features/menu/lib/menuStore'
import { createAdminProduct, deleteAdminProduct, updateAdminProduct } from '@/lib/api/adminProductsApi'
import { ApiError } from '@/lib/api/client'
import { MENU_CATEGORY_LABELS } from '@/features/menu/data/menuData'
import { MENU_SECTION_LABELS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { MenuSection } from '@/types'

const VALID_SECTIONS = new Set(Object.keys(MENU_SECTION_LABELS))

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

export default function AdminMenuPage() {
  const { products, categories, items, loading, refresh } = useAdminMenuData()
  const [searchParams, setSearchParams] = useSearchParams()
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminMenuItem | null>(null)
  const [sections, setSections] = useState<MenuSection[]>(() => getMenuSections())

  useEffect(() => {
    const sectionParam = searchParams.get('section')
    if (searchParams.get('new') === '1' && sectionParam && VALID_SECTIONS.has(sectionParam)) {
      setEditingItem(null)
      setFormOpen(true)
      setSearchParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount to consume the quick-action query params
  }, [])

  function openAddForm() {
    setEditingItem(null)
    setFormOpen(true)
  }

  function openEditForm(item: AdminMenuItem) {
    setEditingItem(item)
    setFormOpen(true)
  }

  async function handleSaveItem(values: MenuItemFormValues, editing: AdminMenuItem | null) {
    try {
      if (editing) {
        const current = products.find((p) => p.id === editing.productId)
        await updateAdminProduct(editing.productId, {
          name: values.name,
          slug: values.slug,
          description: current?.description ?? null,
          price: values.price,
          comparePrice: values.comparePrice ?? null,
          thumbnailUrl: values.thumbnailUrl ?? null,
          categoryId: values.categoryId,
          isFeatured: values.isFeatured,
          isPublished: values.isPublished,
          isActive: current?.isActive ?? true,
        })
        toast.success('Menu item updated')
      } else {
        await createAdminProduct({
          name: values.name,
          slug: values.slug,
          description: null,
          sku: `SKU-${values.slug.toUpperCase()}`,
          price: values.price,
          comparePrice: values.comparePrice ?? null,
          thumbnailUrl: values.thumbnailUrl ?? null,
          categoryId: values.categoryId,
          isFeatured: values.isFeatured,
          isPublished: values.isPublished,
        })
        toast.success('Menu item added')
      }
      refresh()
    } catch (error) {
      toast.error('Could not save menu item', { description: errorMessage(error) })
    }
  }

  async function handleToggleAvailability(item: AdminMenuItem, available: boolean) {
    const current = products.find((p) => p.id === item.productId)
    if (!current) return
    try {
      await updateAdminProduct(item.productId, {
        name: current.name,
        slug: current.slug,
        description: current.description,
        price: current.price,
        comparePrice: current.comparePrice,
        thumbnailUrl: current.thumbnailUrl,
        categoryId: current.categoryId,
        isFeatured: current.isFeatured,
        isPublished: available,
        isActive: current.isActive,
      })
      refresh()
    } catch (error) {
      toast.error('Could not update availability', { description: errorMessage(error) })
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteAdminProduct(deleteTarget.productId)
      deleteMenuItem(deleteTarget.id)
      refresh()
      toast.success(`${deleteTarget.name} removed from the menu`)
    } catch (error) {
      toast.error('Could not delete menu item', { description: errorMessage(error) })
    } finally {
      setDeleteTarget(null)
    }
  }

  function handleSaveSection(section: MenuSection) {
    setSections(upsertMenuSection(section))
    toast.success(`${section.name} updated`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground text-sm">{items.length} items across {sections.length} menu sections</p>
        </div>
        <Button variant="gold" className="gap-1.5" onClick={openAddForm} disabled={categories.length === 0}>
          <Plus className="size-4" />
          Add Menu Item
        </Button>
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card>
            <CardContent className="p-5">
              {loading ? (
                <p className="text-muted-foreground py-12 text-center text-sm">Loading menu items...</p>
              ) : items.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">No menu items yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground border-b text-left text-xs">
                        <th className="pb-2 font-medium">Item</th>
                        <th className="pb-2 font-medium">Category</th>
                        <th className="pb-2 text-right font-medium">Price</th>
                        <th className="pb-2 pl-4 font-medium">Tags</th>
                        <th className="pb-2 pl-4 font-medium">Available</th>
                        <th className="pb-2 pl-4 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.productId} className="border-b last:border-0">
                          <td className="py-2.5">
                            <div className="flex items-center gap-3">
                              <FoodImage
                                itemId={item.id}
                                imageUrl={item.imageUrl}
                                category={item.category}
                                alt={item.name}
                                className="size-10 shrink-0 rounded-md"
                                iconClassName="size-4"
                              />
                              <span className="font-medium">{item.name}</span>
                            </div>
                          </td>
                          <td className="text-muted-foreground py-2.5 whitespace-nowrap">
                            {MENU_CATEGORY_LABELS[item.category] ?? item.category}
                          </td>
                          <td className="py-2.5 text-right font-medium whitespace-nowrap">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="py-2.5 pl-4">
                            <div className="flex flex-wrap gap-1">
                              {item.isSignature && <Badge variant="gold">Signature</Badge>}
                              {item.isBestSeller && <Badge>Bestseller</Badge>}
                              {item.isVeg && (
                                <Badge variant="outline" className="text-green-700">
                                  Veg
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 pl-4">
                            <Switch
                              checked={item.isAvailable !== false}
                              onCheckedChange={(v) => handleToggleAvailability(item, v)}
                              aria-label={`Toggle availability for ${item.name}`}
                            />
                          </td>
                          <td className="py-2.5 pl-4">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label={`Edit ${item.name}`}
                                onClick={() => openEditForm(item)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive size-8"
                                aria-label={`Delete ${item.name}`}
                                onClick={() => setDeleteTarget(item)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {sections.map((section) => (
              <SectionEditorCard key={section.key} section={section} onSave={handleSaveSection} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <MenuItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editingItem}
        categories={categories}
        existingSlugs={items.map((i) => i.id)}
        onSave={handleSaveItem}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="flex flex-col gap-4 p-5">
              <div>
                <p className="font-display text-lg font-semibold">Delete {deleteTarget.name}?</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  This removes the item from the live menu. This can&rsquo;t be undone from here.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function SectionEditorCard({
  section,
  onSave,
}: {
  section: MenuSection
  onSave: (section: MenuSection) => void
}) {
  const [draft, setDraft] = useState(section)
  const dirty = JSON.stringify(draft) !== JSON.stringify(section)

  function update<K extends keyof MenuSection>(key: K, value: MenuSection[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-base font-semibold">{section.name}</p>
          <div className="flex items-center gap-2">
            <Label htmlFor={`avail-${section.key}`} className="text-muted-foreground text-xs font-normal">
              Available
            </Label>
            <Switch
              id={`avail-${section.key}`}
              checked={draft.isAvailableToday}
              onCheckedChange={(v) => update('isAvailableToday', v)}
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`name-${section.key}`} className="text-xs">
            Display Name
          </Label>
          <Input id={`name-${section.key}`} value={draft.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`tagline-${section.key}`} className="text-xs">
            Tagline
          </Label>
          <Input
            id={`tagline-${section.key}`}
            value={draft.tagline}
            onChange={(e) => update('tagline', e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`time-${section.key}`} className="text-xs">
            Available Time
          </Label>
          <Input
            id={`time-${section.key}`}
            value={draft.availableTime}
            onChange={(e) => update('availableTime', e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`desc-${section.key}`} className="text-xs">
            Description
          </Label>
          <Input
            id={`desc-${section.key}`}
            value={draft.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-fit"
          disabled={!dirty}
          onClick={() => onSave(draft)}
        >
          Save Section
        </Button>
      </CardContent>
    </Card>
  )
}
