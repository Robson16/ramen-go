import { useQuery } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OrderList } from './OrderList'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}))

vi.mock('next/image', () => ({
  default: ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean | string
  }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

describe('OrderList Component', () => {
  const mockedUseQuery = vi.mocked(useQuery)

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should render loading state initially', () => {
    mockedUseQuery.mockImplementation(
      () =>
        ({
          isLoading: true,
          data: undefined,
          isError: false,
        }) as unknown as ReturnType<typeof useQuery>,
    )

    render(<OrderList />)

    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should render error state if query fails', () => {
    mockedUseQuery.mockImplementation(
      () =>
        ({
          isLoading: false,
          data: undefined,
          isError: true,
        }) as unknown as ReturnType<typeof useQuery>,
    )

    render(<OrderList />)

    expect(
      screen.getByText('Could not load your orders. Please try again later.'),
    ).toBeInTheDocument()
  })

  it('should render empty state if there are no orders', () => {
    mockedUseQuery.mockImplementation(
      () =>
        ({
          isLoading: false,
          data: [],
          isError: false,
        }) as unknown as ReturnType<typeof useQuery>,
    )

    render(<OrderList />)

    expect(
      screen.getByText("You haven't placed any orders yet."),
    ).toBeInTheDocument()

    const ctaButton = screen.getByRole('link', {
      name: /place my first order/i,
    })

    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton).toHaveAttribute('href', '/')
  })

  it('should render the list of orders successfully', () => {
    const mockOrders = [
      { id: 'fake-order-1', description: 'Tonkotsu with Chashu' },
      { id: 'fake-order-2', description: 'Miso with Chicken' },
    ]

    mockedUseQuery.mockImplementation(
      () =>
        ({
          isLoading: false,
          data: mockOrders,
          isError: false,
        }) as unknown as ReturnType<typeof useQuery>,
    )

    render(<OrderList />)

    expect(screen.getByText('Tonkotsu with Chashu')).toBeInTheDocument()
    expect(screen.getByText('Miso with Chicken')).toBeInTheDocument()

    const links = screen.getAllByRole('link', { name: /view details/i })

    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/success/fake-order-1')
    expect(links[1]).toHaveAttribute('href', '/success/fake-order-2')
  })
})
