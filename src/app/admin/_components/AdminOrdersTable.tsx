'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import {
  CheckCircle,
  ChefHat,
  Clock,
  Drumstick,
  PackageCheck,
  Soup,
} from 'lucide-react'
import { toast } from 'sonner'

import { api } from '@/app/_lib/axios'

interface Order {
  id: string
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED'
  createdAt: string
  broth: { name: string }
  protein: { name: string }
  user?: { name: string }
}

const statusConfig = {
  PENDING: {
    color: 'text-yellow-600 bg-yellow-100',
    icon: Clock,
    label: 'Pending',
  },
  PREPARING: {
    color: 'text-blue-600 bg-blue-100',
    icon: ChefHat,
    label: 'Preparing',
  },
  READY: {
    color: 'text-green-600 bg-green-100',
    icon: CheckCircle,
    label: 'Ready',
  },
  DELIVERED: {
    color: 'text-gray-600 bg-gray-100',
    icon: PackageCheck,
    label: 'Delivered',
  },
}

export function AdminOrdersTable() {
  const queryClient = useQueryClient()

  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await api.get<{ orders: Order[] }>('/admin/orders')
      return response.data.orders
    },
  })

  const { mutate: updateOrderStatus, isPending: isUpdating } = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string
      status: string
    }) => {
      await api.patch(`/admin/orders/${orderId}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        toast.error(
          'This order has already been delivered and cannot be changed.',
        )
        return
      }

      toast.error('Failed to update order status.')
      console.error(error)
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="border-t-primary size-10 animate-spin rounded-full border-4 border-gray-200" />
      </div>
    )
  }

  if (isError || !orders) {
    return (
      <div className="text-secondary py-10 text-center">
        Could not load orders. Please try again.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="text-foreground w-full text-left text-sm">
        <thead className="bg-background text-foreground/70 text-xs uppercase">
          <tr>
            <th className="px-6 py-4">Order ID</th>
            <th className="px-6 py-4">Customer</th>
            <th className="px-6 py-4">Items</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Update Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const config = statusConfig[order.status]
            const Icon = config?.icon || Clock

            return (
              <tr
                key={order.id}
                className="hover:bg-background/50 border-b border-gray-200 transition-colors last:border-0"
              >
                <td className="text-foreground/50 px-6 py-4 font-mono text-xs">
                  {order.id.split('-')[0]}...
                </td>
                <td className="px-6 py-4 font-bold">
                  {order.user?.name || 'Guest'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Soup size={16} />
                      <span>{order.broth?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Drumstick size={16} />
                      <span>{order.protein?.name}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-bold ${config?.color}`}
                  >
                    <Icon size={14} />
                    {config?.label}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus({
                        orderId: order.id,
                        status: e.target.value,
                      })
                    }
                    disabled={isUpdating}
                    className="hover:border-primary focus:border-primary cursor-pointer rounded-lg border border-gray-300 bg-white p-2 text-sm font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="READY">Ready</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </td>
              </tr>
            )
          })}
          {orders.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="text-foreground/70 px-6 py-8 text-center"
              >
                No orders in the queue.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
