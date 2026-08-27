import type { NextConfig } from 'next'

import { env } from '@/app/env'

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
