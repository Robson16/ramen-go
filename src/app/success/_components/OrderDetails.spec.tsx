import { useQuery } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OrderDetails } from './OrderDetails'

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

describe('OrderDetails Component', () => {
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

    render(<OrderDetails orderId="fake-order-123" />)

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

    render(<OrderDetails orderId="fake-order-123" />)

    expect(screen.getByText('Oops! Order not found.')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /back to home/i }),
    ).toBeInTheDocument()
  })

  it('should render order details successfully', () => {
    const mockOrder = {
      id: 'fake-order-123',
      description: 'Tonkotsu with Chashu',
    }

    mockedUseQuery.mockImplementation(
      () =>
        ({
          isLoading: false,
          data: mockOrder,
          isError: false,
        }) as unknown as ReturnType<typeof useQuery>,
    )

    render(<OrderDetails orderId="fake-order-123" />)

    expect(screen.getByText('Tonkotsu with Chashu')).toBeInTheDocument()
    expect(screen.getByText('Your order is being prepared')).toBeInTheDocument()

    const image = screen.getByAltText('A bowl of ramen')

    expect(image).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /place new order/i }),
    ).toBeInTheDocument()
  })
})
