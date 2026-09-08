import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { api } from '@/app/_lib/axios'

import { MetricsCards } from './MetricsCards'

vi.mock('@/app/_lib/axios', () => ({
  api: {
    get: vi.fn(),
  },
}))

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

describe('MetricsCards Component', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should render loading state initially', async () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}))

    const queryClient = createTestQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MetricsCards />
      </QueryClientProvider>,
    )

    const loadingPlaceholders = screen.getAllByText('...')
    expect(loadingPlaceholders).toHaveLength(3)
  })

  test('should render metrics when API call succeeds', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        totalOrders: 145,
        totalBroths: 12,
        totalProteins: 8,
      },
    })

    const queryClient = createTestQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MetricsCards />
      </QueryClientProvider>,
    )

    expect(await screen.findByText('145')).toBeInTheDocument()
    expect(await screen.findByText('12')).toBeInTheDocument()
    expect(await screen.findByText('8')).toBeInTheDocument()
  })
})
