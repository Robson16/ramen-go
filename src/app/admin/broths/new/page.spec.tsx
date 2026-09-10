import { useMutation } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import NewBrothPage from './page'

const mutateMock = vi.fn()
const mockedUseMutation = vi.mocked(useMutation)
let mutationOptions: { onError?: (error: unknown) => void }

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('@/app/admin/_components/MediaPickerModal', () => {
  interface MockMediaPickerModalProps {
    isOpen: boolean
    onSelect: (image: { id: string }) => void
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
              onSelect({ id: 'active-image-id-123' })
              onClose()
            }}
          >
            Select Active
          </button>
          <button
            data-testid="select-inactive-mock"
            onClick={() => {
              onSelect({ id: 'inactive-image-id-456' })
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

function createConflictError(message?: string) {
  const error = AxiosError.from(new Error('Conflict'))
  Object.defineProperty(error, 'response', {
    value: { status: 409, data: message ? { message } : undefined },
  })
  return error
}

describe('NewBrothPage', () => {
  beforeEach(() => {
    mutateMock.mockClear()
    mockedUseMutation.mockImplementation((options) => {
      mutationOptions = options as typeof mutationOptions
      return {
        mutateAsync: mutateMock,
        isPending: false,
      } as unknown as ReturnType<typeof useMutation>
    })
  })

  it('should render the broth form and submit valid data with image IDs', async () => {
    const user = userEvent.setup()

    render(<NewBrothPage />)

    await user.type(screen.getByLabelText('Name'), 'Miso')
    await user.type(
      screen.getByLabelText('Description'),
      'Smooth and savory miso broth.',
    )
    await user.type(screen.getByLabelText('Price (US$)'), '12.50')

    const selectMediaButtons = screen.getAllByText('Select from Media Library')

    await user.click(selectMediaButtons[0])
    await user.click(await screen.findByTestId('select-active-mock'))

    const remainingSelectMediaButtons = screen.getAllByText(
      'Select from Media Library',
    )
    await user.click(remainingSelectMediaButtons[0])
    await user.click(await screen.findByTestId('select-inactive-mock'))

    await user.click(screen.getByRole('button', { name: /save broth/i }))

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1)
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Miso',
          description: 'Smooth and savory miso broth.',
          price: 12.5,
          imageActiveId: 'active-image-id-123',
          imageInactiveId: 'inactive-image-id-456',
        }),
      )
    })
  })

  it('should display validation errors when submitting an empty form', async () => {
    const user = userEvent.setup()

    render(<NewBrothPage />)

    await user.click(screen.getByRole('button', { name: /save broth/i }))

    await waitFor(() => {
      expect(screen.getByText('Active image is required.')).toBeInTheDocument()
      expect(
        screen.getByText('Inactive image is required.'),
      ).toBeInTheDocument()
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

  it('should show the API message when the broth already exists', () => {
    render(<NewBrothPage />)

    mutationOptions.onError?.(createConflictError('Broth already exists.'))

    expect(toast.error).toHaveBeenCalledWith('Broth already exists.')
  })
})
