import { useMutation, useQuery } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import EditProteinPage from './page'

const mutateMock = vi.fn()
const mockedUseMutation = vi.mocked(useMutation)
const mockedUseQuery = vi.mocked(useQuery)

const mockProtein = {
  id: '1',
  name: 'Chashu',
  description: 'Sliced pork belly with rich flavor.',
  price: 10.0,
  imageActive: 'active-1.svg',
  imageInactive: 'inactive-1.svg',
}

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useParams: vi.fn(() => ({
    proteinId: '1',
  })),
}))

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}))

describe('EditProteinPage', () => {
  beforeEach(() => {
    mutateMock.mockClear()
    mockedUseMutation.mockReturnValue({
      mutate: vi.fn((data) => mutateMock(data)),
      isPending: false,
    } as unknown as ReturnType<typeof useMutation>)

    mockedUseQuery.mockReturnValue({
      data: mockProtein,
      isLoading: false,
    } as unknown as ReturnType<typeof useQuery>)
  })

  it('should render the edit protein form with pre-populated data', async () => {
    render(<EditProteinPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Chashu')).toBeInTheDocument()
      expect(
        screen.getByDisplayValue('Sliced pork belly with rich flavor.'),
      ).toBeInTheDocument()
      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    })
  })

  it('should submit form with updated data and optional images', async () => {
    const user = userEvent.setup()

    render(<EditProteinPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Chashu')).toBeInTheDocument()
    })

    await user.clear(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Name'), 'Ajitsuke Tamago')

    await user.clear(screen.getByLabelText('Description'))
    await user.type(
      screen.getByLabelText('Description'),
      'Marinated soft-boiled egg with umami flavor.',
    )

    await user.clear(screen.getByLabelText('Price (US$)'))
    await user.type(screen.getByLabelText('Price (US$)'), '3.50')

    await user.upload(
      screen.getByLabelText('New Active SVG (Optional)'),
      new File(['active'], 'active-new.svg', { type: 'image/svg+xml' }),
    )

    await user.click(screen.getByRole('button', { name: /update protein/i }))

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1)
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Ajitsuke Tamago',
          description: 'Marinated soft-boiled egg with umami flavor.',
          price: 3.5,
        }),
      )
    })
  })

  it('should submit form without new images if not provided', async () => {
    const user = userEvent.setup()

    render(<EditProteinPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Chashu')).toBeInTheDocument()
    })

    await user.clear(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Name'), 'Kikurage')

    await user.click(screen.getByRole('button', { name: /update protein/i }))

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1)
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Kikurage',
          description: 'Sliced pork belly with rich flavor.',
          price: 10,
        }),
      )
    })
  })

  it('should display validation errors when submitting invalid data', async () => {
    const user = userEvent.setup()

    render(<EditProteinPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Chashu')).toBeInTheDocument()
    })

    await user.clear(screen.getByLabelText('Name'))
    await user.clear(screen.getByLabelText('Description'))
    await user.clear(screen.getByLabelText('Price (US$)'))

    await user.click(screen.getByRole('button', { name: /update protein/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Name must be at least 3 characters long.'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Description must be at least 10 characters.'),
      ).toBeInTheDocument()
      expect(screen.getByText('Price is required.')).toBeInTheDocument()

      expect(mutateMock).not.toHaveBeenCalled()
    })
  })

  it('should display loading state while fetching protein data', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useQuery>)

    const { container } = render(<EditProteinPage />)

    expect(container.querySelector('.size-10.animate-spin')).toBeInTheDocument()
  })

  it('should display not found message when protein does not exist', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useQuery>)

    render(<EditProteinPage />)

    expect(screen.getByText('Protein not found.')).toBeInTheDocument()
  })
})
