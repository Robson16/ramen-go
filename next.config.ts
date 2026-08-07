import { env } from '@/app/env'
import type { NextConfig } from 'next'

const imagesUrl = new URL(env.NEXT_PUBLIC_IMAGES_BASE_URL)

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: imagesUrl.hostname,
      },
    ],
  },
}

export default nextConfig
