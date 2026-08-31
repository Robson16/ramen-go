import { useQuery } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/app/_lib/axios'

import { Carte } from './index'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('@/app/_lib/axios', () => ({
  api: {
    post: vi.fn(),
  },
}))

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

const mockBroths = [
  {
    id: 'broth-1',
    name: 'Tonkotsu',
    description: 'Creamy pork broth',
    price: 10,
    imageActive: 'b1-a.png',
    imageInactive: 'b1-i.png',
  },
]

const mockProteins = [
  {
    id: 'protein-1',
    name: 'Chashu',
    description: 'Sliced pork',
    price: 12,
    imageActive: 'p1-a.png',
    imageInactive: 'p1-i.png',
  },
]

describe('Carte Component', () => {
  const mockPush = vi.fn()
  const mockedUseQuery = vi.mocked(useQuery)

  beforeEach(() => {
    vi.resetAllMocks()

    ;(useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    })
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

    render(<Carte />)

    const spinner = document.querySelector('.animate-spin')

    expect(spinner).toBeInTheDocument()
  })

  it('should render error state if queries fail', () => {
    mockedUseQuery.mockImplementation(
      () =>
        ({
          isLoading: false,
          data: undefined,
          isError: true,
        }) as unknown as ReturnType<typeof useQuery>,
    )

    render(<Carte />)

    expect(
      screen.getByText('Could not load menu. Please try again later.'),
    ).toBeInTheDocument()
  })

  it('should render broths and proteins, and handle successful order submission', async () => {
    const user = userEvent.setup()

    mockedUseQuery.mockImplementation((options) => {
      const queryKey = options.queryKey as string[]

      if (queryKey?.[0] === 'broths') {
        return {
          data: mockBroths,
          isLoading: false,
          isError: false,
        } as unknown as ReturnType<typeof useQuery>
      }

      if (queryKey?.[0] === 'proteins') {
        return {
          data: mockProteins,
          isLoading: false,
          isError: false,
        } as unknown as ReturnType<typeof useQuery>
      }

      return {
        data: [],
        isLoading: false,
        isError: false,
      } as unknown as ReturnType<typeof useQuery>
    })

    ;(api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { id: 'fake-order-123' },
    })

    render(<Carte />)

    expect(screen.getByText('Tonkotsu')).toBeInTheDocument()
    expect(screen.getByText('Chashu')).toBeInTheDocument()

    const submitButton = screen.getByRole('button', { name: /place my order/i })
    expect(submitButton).toBeDisabled()

    const brothRadio = screen.getByDisplayValue('broth-1')
    const proteinRadio = screen.getByDisplayValue('protein-1')

    await user.click(brothRadio)
    await user.click(proteinRadio)

    expect(submitButton).toBeEnabled()

    await user.click(submitButton)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/orders', {
        brothId: 'broth-1',
        proteinId: 'protein-1',
      })
      expect(mockPush).toHaveBeenCalledWith('/success/fake-order-123')
    })
  })
})
