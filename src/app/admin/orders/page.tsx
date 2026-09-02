import { AdminOrdersTable } from '../_components/AdminOrdersTable'

export default function AdminOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Order Queue</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Manage customer orders and update their preparation status.
          </p>
        </div>
      </div>

      <AdminOrdersTable />
    </div>
  )
}
