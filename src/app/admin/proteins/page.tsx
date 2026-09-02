import { Plus } from 'lucide-react'
import Link from 'next/link'

import { ProteinsTable } from '../_components/ProteinsTable'

export default function ProteinsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Proteins</h1>
        <Link
          href="/admin/proteins/new"
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
        >
          <Plus size={20} />
          NEW PROTEIN
        </Link>
      </div>

      <ProteinsTable />
    </div>
  )
}
