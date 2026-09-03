import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/app/_lib/axios'

import ResetPasswordPage from './page'

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

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

vi.mock('@/app/_lib/axios', () => ({
  api: {
    patch: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('ResetPasswordPage', () => {
  const mockPush = vi.fn()
  const mockGet = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    ;(useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    })

    ;(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
      get: mockGet,
    })
  })

  it('should show error state if recovery token is missing', () => {
    mockGet.mockReturnValue(null)

    render(<ResetPasswordPage />)

    expect(
      screen.getByText('The recovery link is invalid or incomplete.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /request new link/i }),
    ).toBeInTheDocument()
  })

  it('should render the form correctly if token is present', () => {
    mockGet.mockReturnValue('fake-token-123')

    render(<ResetPasswordPage />)

    expect(screen.getAllByPlaceholderText('********')).toHaveLength(2)
    expect(
      screen.getByRole('button', { name: /reset password/i }),
    ).toBeInTheDocument()
  })

  it('should show validation errors if passwords do not match', async () => {
    mockGet.mockReturnValue('fake-token-123')

    const user = userEvent.setup()

    render(<ResetPasswordPage />)

    const passwordInputs = screen.getAllByPlaceholderText('********')
    await user.type(passwordInputs[0], 'password123')
    await user.type(passwordInputs[1], 'password321')

    await user.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
    })
  })

  it('should call api, show a success toast, and redirect on successful password reset', async () => {
    mockGet.mockReturnValue('fake-token-123')

    const user = userEvent.setup()

    ;(api.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({})

    render(<ResetPasswordPage />)

    const passwordInputs = screen.getAllByPlaceholderText('********')
    await user.type(passwordInputs[0], 'newpassword123')
    await user.type(passwordInputs[1], 'newpassword123')

    await user.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/password/reset', {
        token: 'fake-token-123',
        password: 'newpassword123',
      })

      expect(toast.success).toHaveBeenCalledWith(
        'Password successfully reset! Please log in with your new password.',
      )
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('should show an error toast on api error (e.g., token expired)', async () => {
    mockGet.mockReturnValue('fake-token-expired')

    const user = userEvent.setup()

    ;(api.patch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Expired token'),
    )

    const mockConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    render(<ResetPasswordPage />)

    const passwordInputs = screen.getAllByPlaceholderText('********')
    await user.type(passwordInputs[0], 'newpassword123')
    await user.type(passwordInputs[1], 'newpassword123')

    await user.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Error resetting password. The link may have expired.',
      )
    })

    mockConsoleError.mockRestore()
  })
})
