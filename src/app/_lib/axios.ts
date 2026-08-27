import axios from 'axios'
import { parseCookies } from 'nookies'

import { env } from '@/app/env'

const apiBaseUrl = env.NEXT_PUBLIC_API_BASE_URL

export const api = axios.create({
  baseURL: apiBaseUrl,
})

api.interceptors.request.use((config) => {
  const { '@ramenGo:accessToken': token } = parseCookies()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
