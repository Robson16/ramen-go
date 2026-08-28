'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import bgPatternRed from '@/app/_assets/images/bg-pattern-red.png'
import { Header } from '@/app/_components/Header'
import { api } from '@/app/_lib/axios'

const registerSchema = z.object({
  name: z.string().min(2, 'The name must have at least 3 characters.'),
  email: z.string().email('Enter a valid email address.'),
  password: z
    .string()
    .min(8, 'The password must be at least 8 characters long.'),
})

type RegisterFormInputs = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  })

  async function handleRegister(data: RegisterFormInputs) {
    try {
      await api.post('/accounts', data)

      alert('Registration successful! Please log in.')

      router.push('/login')
    } catch (error) {
      alert('Error registering. Please check your information and try again.')
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
          Register a account
        </h1>

        <form
          onSubmit={handleSubmit(handleRegister)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-zinc-300 p-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="Your name"
              {...register('name')}
            />
            {errors.name && (
              <span className="mt-1 text-sm text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

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
                className="w-full rounded-lg border border-zinc-300 p-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
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
            {errors.password && (
              <span className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full rounded-lg bg-red-500 p-3 font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-600">
          Do you already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-red-500 hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
