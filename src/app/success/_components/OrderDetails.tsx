'use client'

import Image from 'next/image'
import Link from 'next/link'

import ramenImage from '@/app/_assets/images/ramen.png'
import whiteArrowRight from '@/app/_assets/svg/white-arrow-right.svg'
import bgPatternBlue from '@/app/_assets/images/bg-pattern-blue.png'

interface OrderDetailsProps {
  orderDescription: string
}

export function OrderDetails({ orderDescription }: OrderDetailsProps) {
  return (
    <main className="flex min-h-screen flex-col items-stretch lg:flex-row">
      <div
        className="flex flex-1 flex-col items-center justify-center gap-4 bg-size-[450px] p-4 py-16 text-center lg:py-8"
        style={{ backgroundImage: `url(${bgPatternBlue.src})` }}
      >
        <Image
          src={ramenImage}
          alt="A bowl of ramen"
          width={354}
          height={354}
          className="h-auto w-full max-w-88.5 rounded-full"
        />
        <span className="mt-4 text-xl font-black text-white">Your Order:</span>
        <strong className="text-tertiary max-w-md text-3xl font-black">
          {decodeURIComponent(orderDescription)}
        </strong>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-gray-50 p-4 py-16 text-center lg:py-8">
        {/* The bowing image from the old project is not available. */}
        <span lang="ja" className="text-tertiary text-xl font-black">
          どもありがとうございます。
        </span>
        <strong className="text-secondary text-3xl font-black">
          Your order is being prepared
        </strong>
        <p className="text-foreground max-w-xs">
          Hold on, when you least expect you will be eating your ramen.
        </p>
        <Link
          href="/"
          className="bg-primary mt-8 inline-flex items-center gap-4 rounded-full px-8 py-4 font-bold text-white transition-opacity hover:opacity-90"
        >
          PLACE NEW ORDER
          <Image
            src={whiteArrowRight}
            alt="arrow right icon"
            className="h-auto w-auto"
          />
        </Link>
      </div>
    </main>
  )
}
