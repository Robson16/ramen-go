'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import bgPatternRed from '@/app/_assets/images/bg-pattern-red.png'
import { Header } from '@/app/_components/Header'
import { api } from '@/app/_lib/axios'

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match.',
    path: ['passwordConfirmation'],
  })

type ResetPasswordInputs = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInputs>({
    resolver: zodResolver(resetPasswordSchema),
  })

  async function handleResetPassword(data: ResetPasswordInputs) {
    if (!token) {
      alert('Invalid or missing recovery token.')
      return
    }

    try {
      await api.patch('/password/reset', {
        token,
        password: data.password,
      })

      alert(
        'Password successfully reset! Please log in with your new password.',
      )
      router.push('/login')
    } catch (error) {
      alert('Error resetting password. The link may have expired.')
      console.error(error)
    }
  }

  if (!token) {
    return (
      <div className="text-center text-zinc-600">
        <p>The recovery link is invalid or incomplete.</p>
        <button
          onClick={() => router.push('/forgot-password')}
          className="mt-4 font-semibold text-red-500 hover:underline"
        >
          Request new link
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(handleResetPassword)}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          New Password
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

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className="w-full rounded-lg border border-zinc-300 p-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            placeholder="********"
            {...register('passwordConfirmation')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.passwordConfirmation && (
          <span className="mt-1 text-sm text-red-500">
            {errors.passwordConfirmation.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full rounded-lg bg-red-500 p-3 font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Reset Password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-size-[450px] p-4"
      style={{ backgroundImage: `url(${bgPatternRed.src})` }}
    >
      <Header />

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-red-500">
          Create New Password
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-500">
          Enter and confirm your new password.
        </p>

        <Suspense
          fallback={<p className="text-center text-zinc-500">Loading...</p>}
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
