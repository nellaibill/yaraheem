import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchIntegrationSettings, updateIntegrationSettings } from '@/lib/api/integrationSettingsApi'
import { ApiError } from '@/lib/api/client'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { IntegrationSettingsGroupDto } from '@/lib/api/types'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

function sourceBadge(source: number) {
  if (source === 2) return <Badge variant="gold">Database</Badge>
  if (source === 1) return <Badge variant="secondary">Config file</Badge>
  return <Badge variant="outline">Not configured</Badge>
}

export default function AdminIntegrationSettingsPage() {
  useDocumentTitle('Integration Settings')
  const [groups, setGroups] = useState<IntegrationSettingsGroupDto[]>([])
  const [loading, setLoading] = useState(true)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  function load() {
    setLoading(true)
    fetchIntegrationSettings()
      .then((result) => setGroups(result.groups))
      .catch((error) => toast.error('Could not load integration settings', { description: errorMessage(error) }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function saveGroup(group: IntegrationSettingsGroupDto) {
    const changed: Record<string, string> = {}
    for (const field of group.fields) {
      if (field.key in edits) changed[field.key] = edits[field.key]
    }
    if (Object.keys(changed).length === 0) {
      toast.info('Nothing to save', { description: 'Edit a field first.' })
      return
    }

    setSaving(group.provider)
    try {
      await updateIntegrationSettings(changed)
      toast.success(`${group.title} credentials saved`, { description: 'Takes effect on the next send — no restart needed.' })
      setEdits((prev) => {
        const next = { ...prev }
        for (const key of Object.keys(changed)) delete next[key]
        return next
      })
      load()
    } catch (error) {
      toast.error('Could not save credentials', { description: errorMessage(error) })
    } finally {
      setSaving(null)
    }
  }

  async function clearField(key: string) {
    setSaving(key)
    try {
      await updateIntegrationSettings({ [key]: '' })
      toast.success('Cleared', { description: 'Reverted to the config file value, if any.' })
      setEdits((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      load()
    } catch (error) {
      toast.error('Could not clear credential', { description: errorMessage(error) })
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Integration Settings</h1>
        <p className="text-muted-foreground text-sm">
          SMS, WhatsApp, and payment gateway credentials — set here to take effect immediately across every customer,
          no server file or restart required. Values are encrypted at rest and never shown in plaintext once saved.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground py-12 text-center text-sm">Loading...</p>
      ) : (
        groups.map((group) => (
          <Card key={group.provider}>
            <CardContent className="grid gap-5 p-5">
              <h2 className="font-display text-lg font-semibold">{group.title}</h2>

              {group.fields.map((field) => {
                const editedValue = edits[field.key]
                const isEditing = editedValue !== undefined
                return (
                  <div key={field.key} className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      {sourceBadge(field.source)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id={field.key}
                        type="password"
                        value={isEditing ? editedValue : ''}
                        placeholder={field.maskedValue ?? 'Not set'}
                        onChange={(e) => setEdits((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      />
                      {field.source === 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={saving === field.key}
                          onClick={() => clearField(field.key)}
                        >
                          {saving === field.key ? 'Clearing...' : 'Clear'}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}

              <Button
                variant="gold"
                className="w-fit"
                disabled={saving === group.provider}
                onClick={() => saveGroup(group)}
              >
                {saving === group.provider ? 'Saving...' : 'Save'}
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
