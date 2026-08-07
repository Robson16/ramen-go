import { OrderDetails } from '../_components/OrderDetails'

interface SuccessPageProps {
  params: Promise<{
    order: string
  }>
}

export default async function SuccessPage({ params }: SuccessPageProps) {
  const { order } = await params

  return <OrderDetails orderDescription={order} />
}
