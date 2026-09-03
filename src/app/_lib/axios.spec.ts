import { AxiosError, AxiosHeaders } from 'axios'
import { parseCookies } from 'nookies'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/app/_store/auth'

import { api } from './axios'

vi.mock('nookies', () => ({
  parseCookies: vi.fn(),
}))

vi.mock('@/app/_store/auth', () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}))

describe('Axios Interceptors', () => {
  const logoutMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useAuthStore.getState).mockReturnValue({
      user: null,
      setUser: vi.fn(),
      logout: logoutMock,
      updateUser: vi.fn(),
    })
  })

  it('should attach Bearer token to request headers if cookie exists', async () => {
    vi.mocked(parseCookies).mockReturnValue({
      '@ramenGo:accessToken': 'fake-token-123',
    })

    api.defaults.adapter = async (config) => {
      return {
        status: 200,
        data: null,
        headers: new AxiosHeaders(config.headers),
        config,
        statusText: 'OK',
      }
    }

    const response = await api.get('/test-route')

    expect(response.config.headers.Authorization).toBe('Bearer fake-token-123')
  })

  it('should NOT attach Bearer token if cookie does not exist', async () => {
    vi.mocked(parseCookies).mockReturnValue({})

    api.defaults.adapter = async (config) => {
      return {
        status: 200,
        data: null,
        headers: new AxiosHeaders(config.headers),
        config,
        statusText: 'OK',
      }
    }

    const response = await api.get('/test-route')

    expect(response.config.headers.Authorization).toBeUndefined()
  })

  it('should call auth store logout on 401 Unauthorized response', async () => {
    api.defaults.adapter = async (config) => {
      const error = new AxiosError('Unauthorized', undefined, config)
      error.response = {
        data: null,
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      }
      throw error
    }

    await expect(api.get('/test-route')).rejects.toThrow('Unauthorized')

    expect(logoutMock).toHaveBeenCalledTimes(1)
  })

  it('should NOT call logout on other errors (e.g., 400 Bad Request)', async () => {
    api.defaults.adapter = async (config) => {
      const error = new AxiosError('Bad Request', undefined, config)
      error.response = {
        data: null,
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config,
      }
      throw error
    }

    await expect(api.get('/test-route')).rejects.toThrow('Bad Request')

    expect(logoutMock).not.toHaveBeenCalled()
  })
})
