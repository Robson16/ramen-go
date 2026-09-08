import { MetricsCards } from './_components/MetricsCards'

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-black text-foreground">Overview</h1>
      <p className="mt-2 text-foreground/70">
        Welcome to the Ramen Go! admin panel. Select an option from the sidebar
        to manage the restaurant.
      </p>

      <MetricsCards />
    </div>
  )
}
