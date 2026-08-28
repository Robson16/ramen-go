import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from './auth'

describe('Auth Store', () => {
  // Clean the area before each test to ensure isolation.
  beforeEach(() => {
    act(() => {
      useAuthStore.getState().logout()
    })
  })

  it('should initialize with a null user', () => {
    const { result } = renderHook(() => useAuthStore())
    expect(result.current.user).toBeNull()
  })

  it('should set user correctly when setUser is called', () => {
    const { result } = renderHook(() => useAuthStore())

    const mockUser = {
      id: 'user-123',
      name: 'Robson',
      email: 'robson@example.com',
      role: 'USER' as const,
    }

    act(() => {
      result.current.setUser(mockUser)
    })

    expect(result.current.user).toEqual(mockUser)
  })

  it('should clear the user when logout is called', () => {
    const { result } = renderHook(() => useAuthStore())

    const mockUser = {
      id: 'user-123',
      name: 'Robson',
      email: 'robson@example.com',
      role: 'USER' as const,
    }

    // First we log in.
    act(() => {
      result.current.setUser(mockUser)
    })
    expect(result.current.user).toEqual(mockUser)

    // Then we log out.
    act(() => {
      result.current.logout()
    })
    expect(result.current.user).toBeNull()
  })
})
