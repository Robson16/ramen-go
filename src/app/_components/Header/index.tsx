'use client'

import Image from 'next/image'
import Link from 'next/link'
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

  const firstName = user?.name?.split(' ')[0]

  const isAdmin = user?.role?.toLowerCase() === 'admin'

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-5 sm:py-6">
        <Link href="/">
          <Image
            src={ramenGoLogo}
            alt="Ramen Go! Logo"
            className="size-auto"
            priority
          />
        </Link>

        {user && (
          <div className="flex items-center gap-4 text-white sm:gap-6">
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-bold transition-colors hover:text-tertiary"
              >
                Admin Panel
              </Link>
            )}

            <span className="text-sm">
              <span className="hidden sm:inline">Hello, </span>
              <Link
                href="/profile"
                className="transition-colors hover:text-tertiary"
              >
                <span className="sm:hidden">{firstName}</span>

                <span className="hidden sm:inline">{user.name}</span>
              </Link>
            </span>

            <Link
              href="/orders"
              className="text-sm font-bold transition-colors hover:text-tertiary"
            >
              My Orders
            </Link>

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
