import { useMutation, useQuery } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import EditBrothPage from './page'

const mutateMock = vi.fn()
const mockedUseMutation = vi.mocked(useMutation)
const mockedUseQuery = vi.mocked(useQuery)

const mockBroth = {
  id: '1',
  name: 'Tonkotsu',
  description: 'Rich pork bone broth with creamy flavor.',
  price: 14.5,
  imageActive: { id: 'img-active-123', url: 'active-1.svg' },
  imageInactive: { id: 'img-inactive-123', url: 'inactive-1.svg' },
}

vi.mock('@/app/env', () => ({
  env: {
    NEXT_PUBLIC_IMAGES_BASE_URL: 'https://test-bucket.r2.dev',
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useParams: vi.fn(() => ({
    brothId: '1',
  })),
}))

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}))

vi.mock('@/app/admin/_components/MediaPickerModal', () => {
  interface MockMediaPickerModalProps {
    isOpen: boolean
    onSelect: (image: { id: string; url: string }) => void
    onClose: () => void
  }

  return {
    MediaPickerModal: ({
      isOpen,
      onSelect,
      onClose,
    }: MockMediaPickerModalProps) => {
      if (!isOpen) return null

      return (
        <div data-testid="mock-media-picker">
          <button
            data-testid="select-active-mock"
            onClick={() => {
              onSelect({ id: 'new-active-id-999', url: 'new-active.svg' })
              onClose()
            }}
          >
            Select Active
          </button>
          <button
            data-testid="select-inactive-mock"
            onClick={() => {
              onSelect({ id: 'new-inactive-id-888', url: 'new-inactive.svg' })
              onClose()
            }}
          >
            Select Inactive
          </button>
        </div>
      )
    },
  }
})

describe('EditBrothPage', () => {
  beforeEach(() => {
    mutateMock.mockClear()
    mockedUseMutation.mockReturnValue({
      mutate: vi.fn((data) => mutateMock(data)),
      isPending: false,
    } as unknown as ReturnType<typeof useMutation>)

    mockedUseQuery.mockReturnValue({
      data: mockBroth,
      isLoading: false,
    } as unknown as ReturnType<typeof useQuery>)
  })

  it('should render the edit broth form with pre-populated data', async () => {
    render(<EditBrothPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Tonkotsu')).toBeInTheDocument()
      expect(
        screen.getByDisplayValue('Rich pork bone broth with creamy flavor.'),
      ).toBeInTheDocument()
      expect(screen.getByDisplayValue('14.5')).toBeInTheDocument()
    })
  })

  it('should submit form with updated data and new image IDs selected from modal', async () => {
    const user = userEvent.setup()

    render(<EditBrothPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Tonkotsu')).toBeInTheDocument()
    })

    await user.clear(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Name'), 'Miso Broth')

    await user.clear(screen.getByLabelText('Description'))
    await user.type(
      screen.getByLabelText('Description'),
      'Rich and savory miso-flavored broth.',
    )

    await user.clear(screen.getByLabelText('Price (US$)'))
    await user.type(screen.getByLabelText('Price (US$)'), '12')

    const mediaButtons = screen.getAllByText(/CHANGE MEDIA/i)

    await user.click(mediaButtons[0])

    const selectActiveMockButton =
      await screen.findByTestId('select-active-mock')

    await user.click(selectActiveMockButton)

    await user.click(screen.getByRole('button', { name: /update broth/i }))

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1)
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Miso Broth',
          description: 'Rich and savory miso-flavored broth.',
          price: 12,
          imageActiveId: 'new-active-id-999',
        }),
      )
    })
  })

  it('should submit form retaining original image IDs if modal is not used', async () => {
    const user = userEvent.setup()

    render(<EditBrothPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Tonkotsu')).toBeInTheDocument()
    })

    await user.clear(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Name'), 'Shoyu')

    await user.click(screen.getByRole('button', { name: /update broth/i }))

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1)
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Shoyu',
          description: 'Rich pork bone broth with creamy flavor.',
          price: 14.5,
          imageActiveId: expect.any(String),
          imageInactiveId: expect.any(String),
        }),
      )
    })
  })

  it('should display validation errors when submitting invalid data', async () => {
    const user = userEvent.setup()

    render(<EditBrothPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Tonkotsu')).toBeInTheDocument()
    })

    await user.clear(screen.getByLabelText('Name'))
    await user.clear(screen.getByLabelText('Description'))
    await user.clear(screen.getByLabelText('Price (US$)'))

    await user.click(screen.getByRole('button', { name: /update broth/i }))

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

  it('should display loading state while fetching broth data', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useQuery>)

    const { container } = render(<EditBrothPage />)

    expect(container.querySelector('.size-10.animate-spin')).toBeInTheDocument()
  })

  it('should display not found message when broth does not exist', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useQuery>)

    render(<EditBrothPage />)

    expect(screen.getByText('Broth not found.')).toBeInTheDocument()
  })
})
