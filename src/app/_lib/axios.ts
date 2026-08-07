import axios from 'axios'

import { env } from '@/app/env'

const apiKey = env.NEXT_PUBLIC_API_KEY
const apiBaseUrl = env.NEXT_PUBLIC_API_BASE_URL

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'x-api-key': apiKey,
  },
})
