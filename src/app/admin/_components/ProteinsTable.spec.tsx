import { useMutation, useQuery } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ProteinsTable } from './ProteinsTable'

const mockProteins = [
  {
    id: '1',
    name: 'Chashu',
    description: 'Sliced pork belly with rich flavor.',
    price: 10.0,
    imageActive: 'chashu-active.svg',
    imageInactive: 'chashu-inactive.svg',
  },
  {
    id: '2',
    name: 'Ajitsuke Tamago',
    description: 'Marinated soft-boiled egg with umami flavor.',
    price: 3.5,
    imageActive: 'tamago-active.svg',
    imageInactive: 'tamago-inactive.svg',
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

describe('ProteinsTable', () => {
  beforeEach(() => {
    mutateMock.mockClear()
    mockedUseMutation.mockReturnValue({
      mutate: vi.fn((id) => mutateMock(id)),
      isPending: false,
    } as unknown as ReturnType<typeof useMutation>)

    mockedUseQuery.mockReturnValue({
      data: mockProteins,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useQuery>)
  })

  it('should render proteins table with data', async () => {
    render(<ProteinsTable />)

    await waitFor(() => {
      expect(screen.getByText('Chashu')).toBeInTheDocument()
      expect(screen.getByText('Ajitsuke Tamago')).toBeInTheDocument()
      expect(
        screen.getByText('Sliced pork belly with rich flavor.'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Marinated soft-boiled egg with umami flavor.'),
      ).toBeInTheDocument()
      expect(screen.getByText('US$ 10')).toBeInTheDocument()
      expect(screen.getByText('US$ 3.5')).toBeInTheDocument()
    })
  })

  it('should display loading state', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useQuery>)

    const { container } = render(<ProteinsTable />)

    expect(container.querySelector('.size-10.animate-spin')).toBeInTheDocument()
  })

  it('should display error state', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useQuery>)

    render(<ProteinsTable />)

    expect(
      screen.getByText('Could not load proteins. Please try again.'),
    ).toBeInTheDocument()
  })

  it('should display empty state when no proteins', () => {
    mockedUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useQuery>)

    render(<ProteinsTable />)

    expect(screen.getByText('No proteins found.')).toBeInTheDocument()
  })

  it('should call delete mutation with confirmation', async () => {
    const user = userEvent.setup()
    global.confirm = vi.fn(() => true)

    render(<ProteinsTable />)

    await waitFor(() => {
      expect(screen.getByText('Chashu')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button')
    await user.click(deleteButtons[0])

    expect(global.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete Chashu?',
    )
    expect(mutateMock).toHaveBeenCalledWith('1')
  })

  it('should not call delete mutation if user cancels confirmation', async () => {
    const user = userEvent.setup()
    global.confirm = vi.fn(() => false)

    render(<ProteinsTable />)

    await waitFor(() => {
      expect(screen.getByText('Chashu')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button')
    await user.click(deleteButtons[0])

    expect(global.confirm).toHaveBeenCalled()
    expect(mutateMock).not.toHaveBeenCalled()
  })

  it('should render edit links for each protein', async () => {
    render(<ProteinsTable />)

    await waitFor(() => {
      const editLinks = screen.getAllByRole('link')
      expect(editLinks).toHaveLength(2)
      expect(editLinks[0]).toHaveAttribute('href', '/admin/proteins/1/edit')
      expect(editLinks[1]).toHaveAttribute('href', '/admin/proteins/2/edit')
    })
  })
})
