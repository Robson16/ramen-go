'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { setCookie } from 'nookies'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import bgPatternRed from '@/app/_assets/images/bg-pattern-red.png'
import { Header } from '@/app/_components/Header'
import { api } from '@/app/_lib/axios'
import { useAuthStore } from '@/app/_store/auth'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z
    .string()
    .min(8, 'The password must be at least 8 characters long.'),
})

type LoginFormInputs = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  })

  async function handleLogin(data: LoginFormInputs) {
    try {
      const response = await api.post('/sessions', data)

      const { access_token } = response.data

      setCookie(undefined, '@ramenGo:accessToken', access_token, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      const profileResponse = await api.get('/profile', {
        headers: { Authorization: `Bearer ${access_token}` },
      })

      setUser(profileResponse.data.user)

      router.push('/')
    } catch (error) {
      toast.error('Invalid credentials. Please try again.')
      console.error(error)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-size-[450px] p-4"
      style={{ backgroundImage: `url(${bgPatternRed.src})` }}
    >
      <Header />

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-red-500">
          Login
        </h1>

        <form
          onSubmit={handleSubmit(handleLogin)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              E-mail
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-zinc-300 p-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="your@email.com"
              {...register('email')}
            />
            {errors.email && (
              <span className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-lg border border-zinc-300 p-3 pr-12 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="********"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="mt-2 flex flex-col gap-1">
              <Link
                href="/forgot-password"
                className="text-xs text-red-500 hover:underline"
              >
                Forgot your password?
              </Link>
              {errors.password && (
                <span className="text-sm text-red-500">
                  {errors.password.message}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full rounded-lg bg-red-500 p-3 font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Getting in...' : 'Get in'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-600">
          Don&apos;t have an account yet?{' '}
          <Link
            href="/register"
            className="font-semibold text-red-500 hover:underline"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
