'use client'

import { useQuery } from '@tanstack/react-query'

import { api } from '@/app/_lib/axios'

interface Metrics {
  totalBroths: number
  totalProteins: number
  totalOrders: number
}

export function MetricsCards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      const response = await api.get<Metrics>('/admin/metrics')
      return response.data
    },
  })

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div className="rounded-xl border border-gray-200 bg-background p-6">
        <p className="text-sm font-medium text-foreground/70">Orders Today</p>
        <p className="mt-2 text-3xl font-black text-secondary">
          {isLoading ? '...' : metrics?.totalOrders}
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-background p-6">
        <p className="text-sm font-medium text-foreground/70">Active Broths</p>
        <p className="mt-2 text-3xl font-black text-secondary">
          {isLoading ? '...' : metrics?.totalBroths}
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-background p-6">
        <p className="text-sm font-medium text-foreground/70">
          Active Proteins
        </p>
        <p className="mt-2 text-3xl font-black text-secondary">
          {isLoading ? '...' : metrics?.totalProteins}
        </p>
      </div>
    </div>
  )
}
