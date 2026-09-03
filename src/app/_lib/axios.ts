import axios from 'axios'
import { parseCookies } from 'nookies'

import { useAuthStore } from '@/app/_store/auth'
import { env } from '@/app/env'

const apiBaseUrl = env.NEXT_PUBLIC_API_BASE_URL

export const api = axios.create({
  baseURL: apiBaseUrl,
})

// Attach the token to every request
api.interceptors.request.use((config) => {
  const { '@ramenGo:accessToken': token } = parseCookies()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Intercept responses to handle global errors (like 401s)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout()
      }
    }

    return Promise.reject(error)
  },
)
