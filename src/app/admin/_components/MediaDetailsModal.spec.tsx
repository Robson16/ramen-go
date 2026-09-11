import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { api } from '@/app/_lib/axios'

import { MediaDetailsModal } from './MediaDetailsModal'

vi.mock('@/app/_lib/axios', () => ({
  api: {
    delete: vi.fn(),
    patch: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/app/env', () => ({
  env: {
    NEXT_PUBLIC_IMAGES_BASE_URL: 'https://test-bucket.r2.dev',
  },
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const mockImage = {
  id: 'img-123',
  title: 'Naruto Pork',
  url: 'naruto-pork.png',
}

describe('MediaDetailsModal Component', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should render modal with image details when open', () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MediaDetailsModal image={mockImage} isOpen={true} onClose={vi.fn()} />
      </QueryClientProvider>,
    )

    expect(screen.getByDisplayValue('Naruto Pork')).toBeInTheDocument()
    expect(screen.getByText('Media Details')).toBeInTheDocument()
    expect(
      screen.getByDisplayValue('https://test-bucket.r2.dev/naruto-pork.png'),
    ).toBeInTheDocument()
  })

  test('should not render anything when isOpen is false', () => {
    const { container } = render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MediaDetailsModal image={mockImage} isOpen={false} onClose={vi.fn()} />
      </QueryClientProvider>,
    )

    expect(container).toBeEmptyDOMElement()
  })

  test('should call update API when saving changes', async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({})
    const onCloseMock = vi.fn()

    const { toast } = await import('sonner')

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MediaDetailsModal
          image={mockImage}
          isOpen={true}
          onClose={onCloseMock}
        />
      </QueryClientProvider>,
    )

    const titleInput = screen.getByDisplayValue('Naruto Pork')
    fireEvent.change(titleInput, { target: { value: 'New Pork Title' } })

    const saveButton = screen.getByText('SAVE CHANGES')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/admin/images/img-123', {
        title: 'New Pork Title',
      })
      expect(toast.success).toHaveBeenCalledWith('Title updated successfully.')
      expect(onCloseMock).toHaveBeenCalled()
    })
  })

  test('should block deletion and show error if image is in use (409)', async () => {
    const mockError = { response: { status: 409 }, isAxiosError: true }
    vi.mocked(api.delete).mockRejectedValueOnce(mockError)
    const { toast } = await import('sonner')

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MediaDetailsModal image={mockImage} isOpen={true} onClose={vi.fn()} />
      </QueryClientProvider>,
    )

    const deleteButton = screen.getByTitle('Delete Image')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Cannot delete: Image is currently in use.',
      )
    })
  })
})
