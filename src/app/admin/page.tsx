export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-black text-foreground">Overview</h1>
      <p className="mt-2 text-foreground/70">
        Welcome to the Ramen Go! admin panel. Select an option from the sidebar
        to manage the restaurant.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-background p-6">
          <p className="text-sm font-medium text-foreground/70">Orders Today</p>
          <p className="mt-2 text-3xl font-black text-secondary">12</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-background p-6">
          <p className="text-sm font-medium text-foreground/70">
            Active Broths
          </p>
          <p className="mt-2 text-3xl font-black text-secondary">4</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-background p-6">
          <p className="text-sm font-medium text-foreground/70">
            Active Proteins
          </p>
          <p className="mt-2 text-3xl font-black text-secondary">3</p>
        </div>
      </div>
    </div>
  )
}
