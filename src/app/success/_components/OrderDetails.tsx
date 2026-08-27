'use client'

import Image from 'next/image'
import Link from 'next/link'

import bgPatternBlue from '@/app/_assets/images/bg-pattern-blue.png'
import ramenImage from '@/app/_assets/images/ramen.png'
import whiteArrowRight from '@/app/_assets/svg/white-arrow-right.svg'

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
        <strong className="max-w-md text-3xl font-black text-tertiary">
          {decodeURIComponent(orderDescription)}
        </strong>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-gray-50 p-4 py-16 text-center lg:py-8">
        <span lang="ja" className="text-xl font-black text-tertiary">
          どもありがとうございます。
        </span>
        <strong className="text-3xl font-black text-secondary">
          Your order is being prepared
        </strong>
        <p className="max-w-xs text-foreground">
          Hold on, when you least expect you will be eating your ramen.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-4 rounded-full bg-primary px-8 py-4 font-bold text-white transition-opacity hover:opacity-90"
        >
          PLACE NEW ORDER
          <Image
            src={whiteArrowRight}
            alt="arrow right icon"
            className="size-auto"
          />
        </Link>
      </div>
    </main>
  )
}
