import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { setCookie } from 'nookies'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/app/_lib/axios'

import LoginPage from './page'

// 1. Mocks

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

vi.mock('nookies', () => ({
  setCookie: vi.fn(),
}))

vi.mock('@/app/_lib/axios', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('LoginPage', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    ;(useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    })
  })

  it('should render the login form correctly', () => {
    render(<LoginPage />)

    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('********')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /get in/i })).toBeInTheDocument()
  })

  it('should toggle password visibility when clicking the eye icon', async () => {
    const user = userEvent.setup()

    render(<LoginPage />)

    const passwordInput = screen.getByPlaceholderText('********')

    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButton = passwordInput.nextElementSibling as HTMLButtonElement
    await user.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('should show validation errors if fields are empty or invalid', async () => {
    const user = userEvent.setup()

    render(<LoginPage />)

    await user.type(
      screen.getByPlaceholderText('your@email.com'),
      'invalid-email',
    )
    await user.type(screen.getByPlaceholderText('********'), '123')

    await user.click(screen.getByRole('button', { name: /get in/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Enter a valid email address.'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('The password must be at least 8 characters long.'),
      ).toBeInTheDocument()
    })
  })

  it('should call api and redirect on successful login', async () => {
    const user = userEvent.setup()

    ;(api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { access_token: 'fake-jwt-token' },
    })

    ;(api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        user: { id: '1', name: 'Robson', email: 'test@test.com', role: 'USER' },
      },
    })

    render(<LoginPage />)

    await user.type(
      screen.getByPlaceholderText('your@email.com'),
      'robson@test.com',
    )
    await user.type(screen.getByPlaceholderText('********'), 'password123')
    await user.click(screen.getByRole('button', { name: /get in/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/sessions', {
        email: 'robson@test.com',
        password: 'password123',
      })

      expect(setCookie).toHaveBeenCalledWith(
        undefined,
        '@ramenGo:accessToken',
        'fake-jwt-token',
        expect.any(Object),
      )

      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })
})
