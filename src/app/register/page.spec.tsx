import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/app/_lib/axios'

import RegisterPage from './page'

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

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('RegisterPage', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    })
  })

  it('should render the register form correctly', () => {
    render(<RegisterPage />)

    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('********')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^register$/i }),
    ).toBeInTheDocument()
  })

  it('should toggle password visibility when clicking the eye icon', async () => {
    const user = userEvent.setup()

    render(<RegisterPage />)

    const passwordInput = screen.getByPlaceholderText('********')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButton = passwordInput.nextElementSibling as HTMLButtonElement
    await user.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('should show validation errors if fields are invalid', async () => {
    const user = userEvent.setup()

    render(<RegisterPage />)

    await user.type(screen.getByPlaceholderText(/your name/i), 'A')
    await user.type(
      screen.getByPlaceholderText(/your@email.com/i),
      'invalid-email',
    )
    await user.type(screen.getByPlaceholderText('********'), '123')

    await user.click(screen.getByRole('button', { name: /^register$/i }))

    await waitFor(() => {
      expect(
        screen.getByText('The name must have at least 3 characters.'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Enter a valid email address.'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('The password must be at least 8 characters long.'),
      ).toBeInTheDocument()
    })
  })

  it('should call api, show a success toast, and redirect on successful registration', async () => {
    const user = userEvent.setup()

    ;(api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({})

    render(<RegisterPage />)

    await user.type(screen.getByPlaceholderText(/your name/i), 'Robson')
    await user.type(
      screen.getByPlaceholderText(/your@email.com/i),
      'robson@test.com',
    )
    await user.type(screen.getByPlaceholderText('********'), 'password123')

    await user.click(screen.getByRole('button', { name: /^register$/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/accounts', {
        name: 'Robson',
        email: 'robson@test.com',
        password: 'password123',
      })

      expect(toast.success).toHaveBeenCalledWith(
        'Registration successful! Please log in.',
      )
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })
})
