import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { useAdminData } from '@/features/admin/hooks/useAdminData'
import { formatCurrency } from '@/lib/utils'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function AdminCustomersPage() {
  const { customers } = useAdminData()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Customers</h1>
        <p className="text-muted-foreground text-sm">{customers.length} registered customers</p>
      </div>

      <Card>
        <CardContent className="p-5">
          {customers.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">No customers yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left text-xs">
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Mobile</th>
                    <th className="pb-2 font-medium">Joined</th>
                    <th className="pb-2 font-medium">Orders</th>
                    <th className="pb-2 text-right font-medium">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.mobile} className="border-b last:border-0">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-7">
                            <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                              {initials(customer.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                      </td>
                      <td className="text-muted-foreground py-2.5 whitespace-nowrap">+91 {customer.mobile}</td>
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
