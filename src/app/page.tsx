import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Carte } from '@/app/_components/Carte'
import { Hero } from '@/app/_components/Hero'
import { Header } from '@/app/_components/Header'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('@ramenGo:accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <main className="relative">
      <Header />
      <Hero />
      <Carte />
    </main>
  )
}
