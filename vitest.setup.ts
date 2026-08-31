import '@testing-library/jest-dom'

// Define global environment variables to prevent Zod from crashing during tests.
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3333'
process.env.NEXT_PUBLIC_IMAGES_BASE_URL = 'http://localhost:3333'
