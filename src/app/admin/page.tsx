import bgPatternRed from '@/app/_assets/images/bg-pattern-red.png'
import { Header } from '@/app/_components/Header'

export default function AdminDashboard() {
  return (
    <main
      className="relative min-h-screen bg-size-[450px]"
      style={{ backgroundImage: `url(${bgPatternRed.src})` }}
    >
      <Header />
      <div className="mx-auto w-full max-w-content px-4 py-16">
        <h1 className="mt-8 text-center text-4xl font-black text-white">
          Admin Dashboard
        </h1>
        <p className="mt-4 text-center text-white">
          Welcome to the management area for Ramen Go!
        </p>
      </div>
    </main>
  )
}
