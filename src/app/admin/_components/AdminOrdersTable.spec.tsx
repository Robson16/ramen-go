import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/app/_lib/axios'

import { AdminOrdersTable } from './AdminOrdersTable'

vi.mock('@/app/_lib/axios', () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

function createConflictError() {
  const error = AxiosError.from(new Error('Conflict'))
  Object.defineProperty(error, 'response', {
    value: { status: 409 },
  })
  return error
}

describe('AdminOrdersTable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('should render a loading spinner initially', () => {
    ;(api.get as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {}),
    )

    render(
      <QueryClientProvider client={queryClient}>
        <AdminOrdersTable />
      </QueryClientProvider>,
    )

    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should render an error message if the API fails', async () => {
    ;(api.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('API Error'),
    )

    render(
      <QueryClientProvider client={queryClient}>
        <AdminOrdersTable />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(
        screen.getByText(/Could not load orders. Please try again./i),
      ).toBeInTheDocument()
    })
  })

  it('should render the empty state when there are no orders', async () => {
    ;(api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { orders: [] },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <AdminOrdersTable />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText(/No orders in the queue./i)).toBeInTheDocument()
    })
  })

  it('should render a list of rich CQRS orders correctly', async () => {
    ;(api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        orders: [
          {
            id: 'mock-order-id-123',
            status: 'PENDING',
            createdAt: '2026-09-02T12:00:00.000Z',
            broth: { name: 'Tonkotsu' },
            protein: { name: 'Chashu' },
            user: { name: 'Robson Rodrigues' },
          },
        ],
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <AdminOrdersTable />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      // Check customer name
      expect(screen.getByText('Robson Rodrigues')).toBeInTheDocument()

      // Check ingredients
      expect(screen.getByText('Tonkotsu')).toBeInTheDocument()
      expect(screen.getByText('Chashu')).toBeInTheDocument()

      // Check default status styling
      expect(screen.getAllByText('Pending')).toHaveLength(2)
    })
  })

  it('should call the PATCH API to update an order status', async () => {
    ;(api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        orders: [
          {
            id: 'order-to-update',
            status: 'PENDING',
            createdAt: '2026-09-02T12:00:00.000Z',
            broth: { name: 'Miso' },
            protein: { name: 'Chicken' },
            user: { name: 'Customer A' },
          },
        ],
      },
    })

    ;(api.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({})

    render(
      <QueryClientProvider client={queryClient}>
        <AdminOrdersTable />
      </QueryClientProvider>,
    )

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Customer A')).toBeInTheDocument()
    })

    // Find the select element and trigger a change event
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'PREPARING' } })

    // Ensure the correct admin contract URL and payload were called
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        '/admin/orders/order-to-update/status',
        {
          status: 'PREPARING',
        },
      )
    })
  })

  it('should show a specific toast when updating a delivered order', async () => {
    ;(api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        orders: [
          {
            id: 'delivered-order',
            status: 'PENDING',
            createdAt: '2026-09-02T12:00:00.000Z',
            broth: { name: 'Shoyu' },
            protein: { name: 'Tofu' },
            user: { name: 'Customer B' },
          },
        ],
      },
    })

    ;(api.patch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      createConflictError(),
    )

    render(
      <QueryClientProvider client={queryClient}>
        <AdminOrdersTable />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Customer B')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'DELIVERED' },
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'This order has already been delivered and cannot be changed.',
      )
    })
  })
})
