import { useNavigate } from 'react-router-dom'
import { CalendarDays, ClipboardCheck, Moon, Plus, Settings, Soup, Sun, Sunset, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MenuSectionKey } from '@/types'

const QUICK_ACTIONS: Array<{ label: string; icon: typeof Plus; section?: MenuSectionKey; to?: string }> = [
  { label: "Add Today's Menu", icon: Sun, section: 'daily' },
  { label: 'Add Friday Special', icon: CalendarDays, section: 'friday' },
  { label: 'Add Sunday Special', icon: CalendarDays, section: 'sunday' },
  { label: 'Add Lunch Menu', icon: Soup, section: 'lunch' },
  { label: 'Add Dinner Menu', icon: Sunset, section: 'dinner' },
  { label: 'Add Midnight Fuel', icon: Moon, section: 'midnight' },
  { label: 'Add Catering Package', icon: ClipboardCheck, section: 'catering' },
  { label: 'Add Offer Banner', icon: Tag, to: '/admin/settings' },
]

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_ACTIONS.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            navigate(action.section ? `/admin/menu?section=${action.section}&new=1` : (action.to ?? '/admin/menu'))
          }
        >
          <action.icon className="size-3.5" />
          {action.label}
        </Button>
      ))}
      <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5" onClick={() => navigate('/admin/settings')}>
        <Settings className="size-3.5" />
        More Settings
      </Button>
    </div>
  )
}
