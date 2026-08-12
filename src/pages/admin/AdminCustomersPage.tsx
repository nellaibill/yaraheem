import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { fetchAdminCustomers } from '@/lib/api/adminCustomersApi'
import { ApiError } from '@/lib/api/client'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency } from '@/lib/utils'
import type { CustomerSummaryDto } from '@/lib/api/types'

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

export default function AdminCustomersPage() {
  useDocumentTitle('Customers')
  const [customers, setCustomers] = useState<CustomerSummaryDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchAdminCustomers()
      .then((result) => {
        if (!cancelled) setCustomers(result)
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error('Could not load customers', {
            description: error instanceof ApiError ? error.message : 'Something went wrong.',
          })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Customers</h1>
        <p className="text-muted-foreground text-sm">{customers.length} registered customers</p>
      </div>

      <Card>
        <CardContent className="p-5">
          {loading ? (
            <p className="text-muted-foreground py-12 text-center text-sm">Loading...</p>
          ) : customers.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">No customers yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left text-xs">
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Contact</th>
                    <th className="pb-2 font-medium">Joined</th>
                    <th className="pb-2 font-medium">Orders</th>
                    <th className="pb-2 text-right font-medium">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b last:border-0">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-7">
                            <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                              {initials(customer.firstName, customer.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="text-muted-foreground py-2.5 whitespace-nowrap">
                        {customer.phoneNumber ? `+91 ${customer.phoneNumber}` : customer.email}
                      </td>
                      <td className="text-muted-foreground py-2.5 whitespace-nowrap">
                        {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-2.5">{customer.orderCount}</td>
                      <td className="py-2.5 text-right font-semibold">{formatCurrency(customer.totalSpent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
