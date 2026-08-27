import { z } from 'zod'

const clientSchema = z.object({
  NEXT_PUBLIC_IMAGES_BASE_URL: z.string().url({
    message: 'NEXT_PUBLIC_IMAGES_BASE_URL must be a valid URL.',
  }),
  NEXT_PUBLIC_API_BASE_URL: z.string().url({
    message: 'NEXT_PUBLIC_API_BASE_URL must be a valid URL.',
  }),
})

type Env = z.infer<typeof clientSchema>

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

export const env = clientSchema.parse({
  NEXT_PUBLIC_IMAGES_BASE_URL: process.env.NEXT_PUBLIC_IMAGES_BASE_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
})
