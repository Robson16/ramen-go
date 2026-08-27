'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { setCookie } from 'nookies'

import { api } from '@/app/_lib/axios'

const loginSchema = z.object({
  email: z.string().email('Digite um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
})

type LoginFormInputs = z.infer<typeof loginSchema>

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  })

  const router = useRouter()

  async function handleLogin(data: LoginFormInputs) {
    try {
      const response = await api.post('/sessions', data)

      const { access_token } = response.data

      setCookie(undefined, '@ramenGo:accessToken', access_token, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      router.push('/')
    } catch (error) {
      // TODO: Improve to a Toast
      alert('Invalid credentials. Please try again.')
      console.error(error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-red-500">
          RamenGO!
        </h1>

        <form
          onSubmit={handleSubmit(handleLogin)}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              E-mail
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-zinc-300 p-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="seu@email.com"
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
              Senha
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-zinc-300 p-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="********"
              {...register('password')}
            />
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
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
