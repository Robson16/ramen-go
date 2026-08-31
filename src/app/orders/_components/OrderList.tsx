'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'

import defaultRamenImage from '@/app/_assets/images/ramen.png'
import { api } from '@/app/_lib/axios'

interface Order {
  id: string
  description: string
}

export function OrderList() {
  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response = await api.get<{ orders: Order[] }>('/orders')

      return response.data.orders
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="size-16 animate-spin rounded-full border-8 border-gray-200 border-t-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-10 text-center">
        <p className="text-red-500">
          Could not load your orders. Please try again later.
        </p>
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="mb-6 text-lg text-secondary">
          You haven&apos;t placed any orders yet.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-full bg-primary px-8 py-4 font-bold text-white transition-opacity hover:opacity-90"
        >
          PLACE MY FIRST ORDER
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg"
        >
          <Image
            src={defaultRamenImage}
            alt={order.description}
            className="mb-4 size-32 rounded-full object-cover shadow-sm"
          />
          <h2 className="mb-2 text-xl font-bold text-primary">
            {order.description}
          </h2>
          <span className="mb-4 text-sm text-gray-500">
            Order ID: <span className="font-mono text-xs">{order.id}</span>
          </span>
          <Link
            href={`/success/${order.id}`}
            className="mt-auto font-bold text-secondary hover:underline"
          >
            View Details
          </Link>
        </div>
      ))}
    </div>
  )
}
