import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { api } from '@/app/_lib/axios'

import { MediaPickerModal } from './MediaPickerModal'

vi.mock('@/app/_lib/axios', () => ({
  api: {
    get: vi.fn(),
  },
}))

vi.mock('@/app/env', () => ({
  env: {
    NEXT_PUBLIC_IMAGES_BASE_URL: 'https://test-bucket.r2.dev',
  },
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

describe('MediaPickerModal Component', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should fetch and display images when opened', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        images: [
          { id: '1', title: 'Broth 1', url: 'b1.png' },
          { id: '2', title: 'Broth 2', url: 'b2.png' },
        ],
      },
    })

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MediaPickerModal isOpen={true} onClose={vi.fn()} onSelect={vi.fn()} />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByAltText('Broth 1')).toBeInTheDocument()
      expect(screen.getByAltText('Broth 2')).toBeInTheDocument()
    })
  })

  test('should call onSelect with correct image and close modal when clicked', async () => {
    const mockImage = { id: '1', title: 'Selected Broth', url: 'sb.png' }
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { images: [mockImage] },
    })

    const onSelectMock = vi.fn()
    const onCloseMock = vi.fn()

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MediaPickerModal
          isOpen={true}
          onClose={onCloseMock}
          onSelect={onSelectMock}
        />
      </QueryClientProvider>,
    )

    const imageElement = await screen.findByAltText('Selected Broth')
    fireEvent.click(imageElement.parentElement!)

    expect(onSelectMock).toHaveBeenCalledWith(mockImage)
    expect(onCloseMock).toHaveBeenCalled()
  })

  test('should not render anything when isOpen is false', () => {
    const { container } = render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MediaPickerModal isOpen={false} onClose={vi.fn()} onSelect={vi.fn()} />
      </QueryClientProvider>,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
