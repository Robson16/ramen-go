import { useMutation, useQuery } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BrothsTable } from './BrothsTable'

const mockBroths = [
  {
    id: '1',
    name: 'Tonkotsu',
    description: 'Rich pork bone broth with creamy flavor.',
    price: 14.5,
    imageActive: 'tonkotsu-active.svg',
    imageInactive: 'tonkotsu-inactive.svg',
  },
  {
    id: '2',
    name: 'Miso',
    description: 'Rich and savory miso-flavored broth.',
    price: 12.0,
    imageActive: 'miso-active.svg',
    imageInactive: 'miso-inactive.svg',
  },
]

const mutateMock = vi.fn()
const mockedUseQuery = vi.mocked(useQuery)
const mockedUseMutation = vi.mocked(useMutation)

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string
    children: React.ReactNode
  }) => <a href={href}>{children}</a>,
}))

describe('BrothsTable', () => {
  beforeEach(() => {
    mutateMock.mockClear()
    mockedUseMutation.mockReturnValue({
      mutate: vi.fn((id) => mutateMock(id)),
      isPending: false,
    } as unknown as ReturnType<typeof useMutation>)

    mockedUseQuery.mockReturnValue({
      data: mockBroths,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useQuery>)
  })

  it('should render broths table with data', async () => {
    render(<BrothsTable />)

    await waitFor(() => {
      expect(screen.getByText('Tonkotsu')).toBeInTheDocument()
      expect(screen.getByText('Miso')).toBeInTheDocument()
      expect(
        screen.getByText('Rich pork bone broth with creamy flavor.'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Rich and savory miso-flavored broth.'),
      ).toBeInTheDocument()
      expect(screen.getByText('US$ 14.5')).toBeInTheDocument()
      expect(screen.getByText('US$ 12')).toBeInTheDocument()
    })
  })

  it('should display loading state', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useQuery>)

    const { container } = render(<BrothsTable />)

    expect(container.querySelector('.size-10.animate-spin')).toBeInTheDocument()
  })

  it('should display error state', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useQuery>)

    render(<BrothsTable />)

    expect(
      screen.getByText('Could not load broths. Please try again.'),
    ).toBeInTheDocument()
  })

  it('should display empty state when no broths', () => {
    mockedUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useQuery>)

    render(<BrothsTable />)

    expect(screen.getByText('No broths found.')).toBeInTheDocument()
  })

  it('should call delete mutation with confirmation', async () => {
    const user = userEvent.setup()
    global.confirm = vi.fn(() => true)

    render(<BrothsTable />)

    await waitFor(() => {
      expect(screen.getByText('Tonkotsu')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button')
    await user.click(deleteButtons[0])

    expect(global.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete Tonkotsu?',
    )
    expect(mutateMock).toHaveBeenCalledWith('1')
  })

  it('should not call delete mutation if user cancels confirmation', async () => {
    const user = userEvent.setup()
    global.confirm = vi.fn(() => false)

    render(<BrothsTable />)

    await waitFor(() => {
      expect(screen.getByText('Tonkotsu')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button')
    await user.click(deleteButtons[0])

    expect(global.confirm).toHaveBeenCalled()
    expect(mutateMock).not.toHaveBeenCalled()
  })

  it('should render edit links for each broth', async () => {
    render(<BrothsTable />)

    await waitFor(() => {
      const editLinks = screen.getAllByRole('link')
      expect(editLinks).toHaveLength(2)
      expect(editLinks[0]).toHaveAttribute('href', '/admin/broths/1/edit')
      expect(editLinks[1]).toHaveAttribute('href', '/admin/broths/2/edit')
    })
  })
})
