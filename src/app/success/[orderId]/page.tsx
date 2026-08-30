import { OrderDetails } from '../_components/OrderDetails'

interface SuccessPageProps {
  params: Promise<{
    orderId: string
  }>
}

export default async function SuccessPage({ params }: SuccessPageProps) {
  const { orderId } = await params

  return <OrderDetails orderId={orderId} />
}
