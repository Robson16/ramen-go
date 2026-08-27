'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { destroyCookie } from 'nookies'

import ramenGoLogo from '@/app/_assets/svg/ramen-go-logo.svg'
import { useAuthStore } from '@/app/_store/auth'

export function Header() {
  const router = useRouter()

  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  function handleLogout() {
    destroyCookie(undefined, '@ramenGo:accessToken')
    logout()
    router.push('/login')
  }

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-5 sm:py-6">
        <Image
          src={ramenGoLogo}
          alt="Ramen Go! Logo"
          className="size-auto"
          priority
        />

        {user && (
          <div className="flex items-center gap-3 text-white sm:gap-4">
            <span className="hidden text-sm sm:inline">Hello, {user.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-bold transition-colors hover:text-tertiary"
            >
              Exit
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
