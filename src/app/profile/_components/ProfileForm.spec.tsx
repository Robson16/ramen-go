import { useMutation, useQuery } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/app/_store/auth'

import { ProfileForm } from './ProfileForm'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('nookies', () => ({
  destroyCookie: vi.fn(),
}))

vi.mock('@/app/_store/auth', () => ({
  useAuthStore: vi.fn(),
}))

describe('ProfileForm Component', () => {
  const mockedUseQuery = vi.mocked(useQuery)
  const mockedUseMutation = vi.mocked(useMutation)
  const mockedUseAuthStore = vi.mocked(useAuthStore)

  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.resetAllMocks()

    vi.spyOn(window, 'confirm').mockImplementation(() => true)

    type AuthState = ReturnType<typeof useAuthStore.getState>

    mockedUseAuthStore.mockImplementation(
      (selector: (state: AuthState) => unknown) => {
        return selector({
          user: {
            id: '1',
            name: 'Robson',
            email: 'robson@example.com',
            role: 'USER',
          },
          setUser: vi.fn(),
          login: vi.fn(),
          logout: vi.fn(),
          updateUser: vi.fn(),
        } as AuthState)
      },
    )

    mockedUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useMutation>)
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

    render(<ProfileForm />)
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

    render(<ProfileForm />)
    expect(
      screen.getByText('Could not load your profile. Please try again later.'),
    ).toBeInTheDocument()
  })

  it('should render profile form successfully', () => {
    mockedUseQuery.mockImplementation(
      () =>
        ({
          isLoading: false,
          data: { id: '1', name: 'Robson', email: 'robson@example.com' },
          isError: false,
        }) as unknown as ReturnType<typeof useQuery>,
    )

    render(<ProfileForm />)

    expect(screen.getByLabelText(/name/i)).toHaveValue('Robson')
    expect(screen.getByLabelText(/email/i)).toHaveValue('robson@example.com')
    expect(screen.getByLabelText(/email/i)).toBeDisabled()
  })

  it('should call updateProfile mutation when form is submitted with new name', async () => {
    const user = userEvent.setup()

    mockedUseQuery.mockImplementation(
      () =>
        ({
          isLoading: false,
          data: { id: '1', name: 'Robson', email: 'robson@example.com' },
          isError: false,
        }) as unknown as ReturnType<typeof useQuery>,
    )

    render(<ProfileForm />)

    const nameInput = screen.getByLabelText(/name/i)

    await user.clear(nameInput)
    await user.type(nameInput, 'Robson Atualizado')

    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith('Robson Atualizado')
    })
  })

  it('should call deleteAccount mutation after confirm', async () => {
    const user = userEvent.setup()

    mockedUseQuery.mockImplementation(
      () =>
        ({
          isLoading: false,
          data: { id: '1', name: 'Robson', email: 'robson@example.com' },
          isError: false,
        }) as unknown as ReturnType<typeof useQuery>,
    )

    render(<ProfileForm />)

    const deleteButton = screen.getByRole('button', {
      name: /delete my account/i,
    })
    await user.click(deleteButton)

    expect(window.confirm).toHaveBeenCalled()

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith()
    })
  })
})
