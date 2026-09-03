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

  it('should render the broth form and submits valid data', async () => {
    const user = userEvent.setup()

    render(<NewBrothPage />)

    await user.upload(
      screen.getByLabelText('Active SVG Image'),
      new File(['active'], 'active.svg', { type: 'image/svg+xml' }),
    )

    await user.upload(
      screen.getByLabelText('Inactive SVG Image'),
      new File(['inactive'], 'inactive.svg', { type: 'image/svg+xml' }),
    )

    await user.type(screen.getByLabelText('Name'), 'Miso')
    await user.type(
      screen.getByLabelText('Description'),
      'Smooth and savory miso broth.',
    )
    await user.type(screen.getByLabelText('Price (US$)'), '12.50')

    await user.click(screen.getByRole('button', { name: /save broth/i }))

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1)
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Miso',
          description: 'Smooth and savory miso broth.',
          price: 12.5,
          imageActive: expect.any(FileList),
          imageInactive: expect.any(FileList),
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
