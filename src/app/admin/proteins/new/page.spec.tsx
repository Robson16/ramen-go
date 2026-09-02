import { useMutation } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import NewProteinPage from './page'

const mutateMock = vi.fn()
const mockedUseMutation = vi.mocked(useMutation)

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

describe('NewProteinPage', () => {
  beforeEach(() => {
    mutateMock.mockClear()
    mockedUseMutation.mockImplementation(
      () =>
        ({
          mutateAsync: mutateMock,
          isPending: false,
        }) as unknown as ReturnType<typeof useMutation>,
    )
  })

  it('should render the protein form and submits valid data', async () => {
    const user = userEvent.setup()

    render(<NewProteinPage />)

    await user.upload(
      screen.getByLabelText('Active SVG Image'),
      new File(['active'], 'active.svg', { type: 'image/svg+xml' }),
    )

    await user.upload(
      screen.getByLabelText('Inactive SVG Image'),
      new File(['inactive'], 'inactive.svg', { type: 'image/svg+xml' }),
    )

    await user.type(screen.getByLabelText('Name'), 'Chashu')
    await user.type(
      screen.getByLabelText('Description'),
      'Sliced pork belly with rich flavor.',
    )
    await user.type(screen.getByLabelText('Price (US$)'), '10.00')

    await user.click(screen.getByRole('button', { name: /save protein/i }))

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1)
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Chashu',
          description: 'Sliced pork belly with rich flavor.',
          price: 10,
          imageActive: expect.any(FileList),
          imageInactive: expect.any(FileList),
        }),
      )
    })
  })

  it('should display validation errors when submitting an empty form', async () => {
    const user = userEvent.setup()

    render(<NewProteinPage />)

    await user.click(screen.getByRole('button', { name: /save protein/i }))

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
})
