import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Carte } from '@/app/_components/Carte'
import { Header } from '@/app/_components/Header'
import { Hero } from '@/app/_components/Hero'

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
