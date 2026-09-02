import { Beef, LayoutDashboard, ListOrdered, Soup } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'

import bgPatternRed from '@/app/_assets/images/bg-pattern-red.png'
import { Header } from '@/app/_components/Header'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-screen flex-col bg-size-[450px]"
      style={{ backgroundImage: `url(${bgPatternRed.src})` }}
    >
      <Header />

      <div className="mt-12 flex w-full flex-1 flex-col gap-4 p-4 md:flex-row">
        <aside className="w-full shrink-0 rounded-2xl bg-white p-6 shadow-sm md:w-64">
          <nav className="flex flex-col gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-foreground transition-colors hover:bg-secondary/10 hover:text-secondary"
            >
              <LayoutDashboard size={20} />
              Dashboard
            </Link>

            <Link
              href="/admin/broths"
              className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-foreground transition-colors hover:bg-secondary/10 hover:text-secondary"
            >
              <Soup size={20} />
              Broths
            </Link>

            <Link
              href="/admin/proteins"
              className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-foreground transition-colors hover:bg-secondary/10 hover:text-secondary"
            >
              <Beef size={20} />
              Proteins
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-foreground transition-colors hover:bg-secondary/10 hover:text-secondary"
            >
              <ListOrdered size={20} />
              Order Queue
            </Link>
          </nav>
        </aside>

        <main className="flex-1 rounded-2xl bg-white p-6 shadow-sm md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
