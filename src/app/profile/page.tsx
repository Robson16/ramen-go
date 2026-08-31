import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import bgPatternBlue from '@/app/_assets/images/bg-pattern-blue.png'
import { Header } from '@/app/_components/Header'

import { ProfileForm } from './_components/ProfileForm'

export default async function ProfilePage() {
  return (
    <main
      className="relative min-h-screen bg-size-[450px]"
      style={{ backgroundImage: `url(${bgPatternBlue.src})` }}
    >
      <Header />
      <div className="mx-auto w-full max-w-content px-4 py-16">
        <div className="relative mb-8 flex items-center justify-center">
          <Link
            href="/"
            className="absolute left-0 flex gap-4 align-middle text-sm font-bold text-tertiary transition-opacity hover:opacity-80"
          >
            <ArrowLeft /> Back
          </Link>

          <h1 className="text-3xl font-black text-tertiary">My Profile</h1>
        </div>

        <ProfileForm />
      </div>
    </main>
  )
}
