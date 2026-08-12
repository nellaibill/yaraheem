import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, Mail, MessageSquare, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  fetchCateringInquiries,
  fetchContactMessages,
  resolveContactMessage,
  updateCateringInquiryStatus,
} from '@/lib/api/leadsApi'
import { ApiError } from '@/lib/api/client'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { CateringInquiryDto, CateringInquiryStatus, ContactMessageDto } from '@/lib/api/types'

const CATERING_STATUS_LABELS: Record<CateringInquiryStatus, string> = {
  1: 'New',
  2: 'Contacted',
  3: 'Booked',
  4: 'Closed',
}

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminInquiriesPage() {
  useDocumentTitle('Inquiries')
  const [messages, setMessages] = useState<ContactMessageDto[]>([])
  const [inquiries, setInquiries] = useState<CateringInquiryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([fetchContactMessages(), fetchCateringInquiries()])
      .then(([contactMessages, cateringInquiries]) => {
        if (cancelled) return
        setMessages(contactMessages)
        setInquiries(cateringInquiries)
      })
      .catch((error) => {
        if (!cancelled) toast.error('Could not load inquiries', { description: errorMessage(error) })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [version])

  function refresh() {
    setVersion((v) => v + 1)
  }

  async function handleResolve(id: string) {
    try {
      await resolveContactMessage(id)
      toast.success('Marked resolved')
      refresh()
    } catch (error) {
      toast.error('Could not update message', { description: errorMessage(error) })
    }
  }

  async function handleStatusChange(id: string, status: CateringInquiryStatus) {
    try {
      await updateCateringInquiryStatus(id, status)
      toast.success('Status updated')
      refresh()
    } catch (error) {
      toast.error('Could not update inquiry', { description: errorMessage(error) })
    }
  }

  const openMessages = messages.filter((m) => !m.isResolved).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Inquiries</h1>
        <p className="text-muted-foreground text-sm">
          {openMessages} open message{openMessages === 1 ? '' : 's'} · {inquiries.length} catering inquiries
        </p>
      </div>

      <Tabs defaultValue="catering">
        <TabsList>
          <TabsTrigger value="catering">Catering Inquiries</TabsTrigger>
          <TabsTrigger value="messages">Contact Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="catering" className="mt-4">
          <Card>
            <CardContent className="p-5">
              {loading ? (
                <p className="text-muted-foreground py-12 text-center text-sm">Loading...</p>
              ) : inquiries.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">No catering inquiries yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{inquiry.name}</p>
                          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-3 text-xs">
                            <span className="flex items-center gap-1">
                              <Phone className="size-3" />+91 {inquiry.phone}
                            </span>
                            {inquiry.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="size-3" />
                                {inquiry.email}
                              </span>
                            )}
                            <span>{formatDate(inquiry.createdAt)}</span>
                          </div>
                        </div>
                        <Select
                          value={String(inquiry.status)}
                          onValueChange={(v) => handleStatusChange(inquiry.id, Number(v) as CateringInquiryStatus)}
                        >
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(CATERING_STATUS_LABELS) as unknown as CateringInquiryStatus[]).map((status) => (
                              <SelectItem key={status} value={String(status)}>
                                {CATERING_STATUS_LABELS[status]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-muted-foreground mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
                        {inquiry.eventDate && <span>Event: {formatDate(inquiry.eventDate)}</span>}
                        {inquiry.guestCount && <span>{inquiry.guestCount} guests</span>}
                        {inquiry.packageName && <span>Package: {inquiry.packageName}</span>}
                      </div>
                      {inquiry.message && <p className="mt-2 text-sm">{inquiry.message}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          <Card>
            <CardContent className="p-5">
              {loading ? (
                <p className="text-muted-foreground py-12 text-center text-sm">Loading...</p>
              ) : messages.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">No messages yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((message) => (
                    <div key={message.id} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{message.name}</p>
                            {message.isResolved ? (
                              <Badge variant="secondary">Resolved</Badge>
                            ) : (
                              <Badge variant="gold">Open</Badge>
                            )}
                          </div>
                          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-3 text-xs">
                            <span className="flex items-center gap-1">
                              <Mail className="size-3" />
                              {message.email}
                            </span>
                            {message.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="size-3" />
                                {message.phone}
                              </span>
                            )}
                            <span>{formatDate(message.createdAt)}</span>
                          </div>
                        </div>
                        {!message.isResolved && (
                          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => handleResolve(message.id)}>
                            <Check className="size-3.5" />
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                      <p className="mt-2 flex items-start gap-1.5 text-sm">
                        <MessageSquare className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                        <span>
                          <span className="font-medium">{message.subject}:</span> {message.message}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
