'use client'

import Image from 'next/image'
import { MouseEvent } from 'react'

import bgPatternRed from '@/app/_assets/images/bg-pattern-red.png'
import arrowRight from '@/app/_assets/svg/arrow-right.svg'
import heroIllustration from '@/app/_assets/svg/hero-illustration.svg'
import ramenGoLogo from '@/app/_assets/svg/ramen-go-logo.svg'

export function Hero() {
  const handleScrollToCarte = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()

    const carteSection = document.querySelector('#carte')

    if (carteSection) {
      carteSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      className="relative flex min-h-screen w-full items-center justify-center bg-size-[450px] py-4"
      style={{ backgroundImage: `url(${bgPatternRed.src})` }}
    >
      <div className="max-w-content w-full px-4">
        <Image
          src={ramenGoLogo}
          alt="Ramen Go! Logo"
          className="mx-auto mb-8 h-auto w-auto lg:absolute lg:top-8 lg:left-8 lg:mx-0 lg:mb-0"
          priority
        />
        <div className="flex flex-col-reverse items-center justify-center gap-8 lg:flex-row">
          <div className="z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="flex items-end justify-center gap-2 lg:justify-start">
              <span
                lang="ja"
                className="text-tertiary font-mono text-5xl font-black [writing-mode:vertical-rl]"
              >
                ラーメン
              </span>
              <strong className="font-heading text-[120px] leading-none font-black text-white lg:text-[160px]">
                GO!
              </strong>
            </h1>

            <p className="mt-4 max-w-52 text-base leading-6 text-white">
              Enjoy a good ramen in the comfort of your house. Create your own
              ramen and choose your favorite flavour combination!
            </p>

            <a
              href="#carte"
              onClick={handleScrollToCarte}
              className="bg-primary mt-8 inline-flex items-center gap-10 rounded-full px-4 py-4 font-bold text-white transition-colors hover:bg-blue-700"
            >
              ORDER NOW
              <Image
                src={arrowRight}
                alt="arrow right icon"
                className="h-auto w-auto"
              />
            </a>
          </div>

          <Image
            src={heroIllustration}
            alt="Delivery girl illustration"
            className="h-auto w-auto max-w-xs shrink-0 lg:-ml-50 lg:max-h-[95vh] lg:max-w-none"
            loading="eager"
          />
        </div>
      </div>
    </section>
  )
}
