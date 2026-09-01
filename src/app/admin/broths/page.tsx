import { Plus } from 'lucide-react'
import Link from 'next/link'

import { BrothsTable } from '../_components/BrothsTable'

export default function BrothsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Broths</h1>
        <Link
          href="/admin/broths/new"
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
        >
          <Plus size={20} />
          NEW BROTH
        </Link>
      </div>

      <BrothsTable />
    </div>
  )
}
