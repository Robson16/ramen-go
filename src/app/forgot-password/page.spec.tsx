import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/app/_lib/axios'

import ForgotPasswordPage from './page'

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
}))

vi.mock('@/app/_lib/axios', () => ({
  api: {
    post: vi.fn(),
  },
}))

const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {})

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the form correctly', () => {
    render(<ForgotPasswordPage />)

    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /send recovery link/i }),
    ).toBeInTheDocument()
  })

  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup()

    render(<ForgotPasswordPage />)

    await user.type(
      screen.getByPlaceholderText('your@email.com'),
      'invalid-email',
    )
    await user.click(
      screen.getByRole('button', { name: /send recovery link/i }),
    )

    await waitFor(() => {
      expect(
        screen.getByText('Enter a valid email address.'),
      ).toBeInTheDocument()
    })
  })

  it('should call api and show success state', async () => {
    const user = userEvent.setup()

    ;(api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({})

    render(<ForgotPasswordPage />)

    await user.type(
      screen.getByPlaceholderText('your@email.com'),
      'robson@test.com',
    )
    await user.click(
      screen.getByRole('button', { name: /send recovery link/i }),
    )

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/password/forgot', {
        email: 'robson@test.com',
      })

      expect(
        screen.getByText(
          /If the email is registered, you will receive a link/i,
        ),
      ).toBeInTheDocument()

      expect(
        screen.getByRole('link', { name: /back to login/i }),
      ).toBeInTheDocument()
      expect(
        screen.queryByPlaceholderText('your@email.com'),
      ).not.toBeInTheDocument()
    })
  })

  it('should alert on api error', async () => {
    const user = userEvent.setup()

    ;(api.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('API Error'),
    )

    const mockConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    render(<ForgotPasswordPage />)

    await user.type(
      screen.getByPlaceholderText('your@email.com'),
      'robson@test.com',
    )
    await user.click(
      screen.getByRole('button', { name: /send recovery link/i }),
    )

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Error sending email. Please check if the address is correct.',
      )
    })

    mockConsoleError.mockRestore()
  })
})
