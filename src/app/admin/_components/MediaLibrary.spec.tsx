import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { api } from '@/app/_lib/axios'

import { MediaLibrary } from './MediaLibrary'

vi.mock('@/app/_lib/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
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
    defaultOptions: { queries: { retry: false } },
  })

describe('MediaLibrary Component', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should render loading state initially', () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}))

    const { container } = render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MediaLibrary />
      </QueryClientProvider>,
    )

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  test('should fetch and display images in a grid', async () => {
    const mockImages = [
      { id: '1', title: 'Delicious Broth', url: 'broth.png' },
      { id: '2', title: 'Spicy Pork', url: 'pork.png' },
    ]

    vi.mocked(api.get).mockResolvedValueOnce({
      data: { images: mockImages },
    })

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MediaLibrary />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByAltText('Delicious Broth')).toBeInTheDocument()
      expect(screen.getByAltText('Spicy Pork')).toBeInTheDocument()
      expect(screen.getByText('Page 1')).toBeInTheDocument()
    })
  })

  test('should show empty state message when no images are returned', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { images: [] },
    })

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MediaLibrary />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('No media files found.')).toBeInTheDocument()
    })
  })
})
