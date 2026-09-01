import { Carte } from '@/app/_components/Carte'
import { Header } from '@/app/_components/Header'
import { Hero } from '@/app/_components/Hero'

export default function Home() {
  return (
    <main className="relative">
      <Header />
      <Hero />
      <Carte />
    </main>
  )
}
