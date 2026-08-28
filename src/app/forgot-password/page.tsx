'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import bgPatternRed from '@/app/_assets/images/bg-pattern-red.png'
import { Header } from '@/app/_components/Header'
import { api } from '@/app/_lib/axios'

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
})

type ForgotPasswordInputs = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function handleSendResetEmail(data: ForgotPasswordInputs) {
    try {
      await api.post('/password/forgot', data)
      setIsSuccess(true)
    } catch (error) {
      alert('Error sending email. Please check if the address is correct.')
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
        <h1 className="mb-2 text-center text-3xl font-bold text-red-500">
          Recover Password
        </h1>

        {isSuccess ? (
          <div className="text-center">
            <p className="mt-4 mb-6 text-zinc-600">
              If the email is registered, you will receive a link with
              instructions to reset your password.
            </p>
            <Link
              href="/login"
              className="inline-block w-full rounded-lg bg-zinc-200 p-3 font-bold text-zinc-700 transition-colors hover:bg-zinc-300"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-center text-sm text-zinc-500">
              Enter your email below and we&apos;ll send you a link to create a
              new password.
            </p>

            <form
              onSubmit={handleSubmit(handleSendResetEmail)}
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 w-full rounded-lg bg-red-500 p-3 font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send recovery link'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-zinc-600">
              Remember your password?{' '}
              <Link
                href="/login"
                className="font-semibold text-red-500 hover:underline"
              >
                Log in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
