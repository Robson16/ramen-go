'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useState } from 'react'

import { api } from '@/app/_lib/axios'
import { env } from '@/app/env'

import whiteArrowRight from '@/app/_assets/svg/white-arrow-right.svg'

interface Ingredient {
  id: string
  imageActive: string
  imageInactive: string
  name: string
  description: string
  price: number
}

export function Carte() {
  const [selectedBrothId, setSelectedBrothId] = useState<string | null>(null)
  const [selectedProteinId, setSelectedProteinId] = useState<string | null>(
    null,
  )

  const {
    data: broths = [],
    isLoading: isLoadingBroths,
    isError: isErrorBroths,
  } = useQuery({
    queryKey: ['broths'],
    queryFn: async () => {
      const response = await api.get<{ broths: Ingredient[] }>('/broths')

      return response.data.broths
    },
  })

  const {
    data: proteins = [],
    isLoading: isLoadingProteins,
    isError: isErrorProteins,
  } = useQuery({
    queryKey: ['proteins'],
    queryFn: async () => {
      const response = await api.get<{ proteins: Ingredient[] }>('/proteins')

      return response.data.proteins
    },
  })

  const isLoading = isLoadingBroths || isLoadingProteins
  const hasError = isErrorBroths || isErrorProteins

  const handleSubmit = async () => {
    console.log('Submitting order...')
  }

  if (isLoading) {
    return (
      <section className="flex h-64 items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-8 border-gray-200 border-t-blue-600" />
      </section>
    )
  }

  if (hasError) {
    return (
      <section className="py-10 text-center">
        <p className="text-red-500">
          Could not load menu. Please try again later.
        </p>
      </section>
    )
  }

  const renderOptions = (
    items: Ingredient[],
    groupName: 'brothId' | 'proteinId',
    setter: (id: string) => void,
  ) =>
    items.map((item) => (
      <label
        key={item.id}
        className="group has-checked:bg-primary relative cursor-pointer rounded-lg bg-white p-4 text-center shadow-md transition-all hover:shadow-lg has-checked:shadow-lg"
      >
        <input
          type="radio"
          name={groupName}
          value={item.id}
          className="peer sr-only"
          onChange={() => setter(item.id)}
          required
        />

        <Image
          src={`${env.NEXT_PUBLIC_IMAGES_BASE_URL}/${item.imageInactive}`}
          alt={item.name}
          width={120}
          height={120}
          className="mx-auto block h-auto w-auto group-has-checked:hidden"
        />
        <Image
          src={`${env.NEXT_PUBLIC_IMAGES_BASE_URL}/${item.imageActive}`}
          alt={item.name}
          width={120}
          height={120}
          className="mx-auto hidden h-auto w-auto group-has-checked:block"
        />

        <span className="text-primary mt-2 block font-bold group-has-checked:text-white">
          {item.name}
        </span>
        <p className="text-sm group-has-checked:text-white">
          {item.description}
        </p>
        <span className="text-secondary group-has-checked:text-tertiary mt-1 block font-semibold">
          US$ {item.price}
        </span>
      </label>
    ))

  return (
    <section id="carte" className="bg-gray-50 py-16">
      <div className="max-w-content mx-auto w-full px-4">
        <form action={handleSubmit}>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">
              First things first: select your favorite broth.
            </p>
            <p className="mt-1 text-gray-600">
              It will give the whole flavor on your ramen soup.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {renderOptions(broths, 'brothId', setSelectedBrothId)}
          </div>

          <div className="mt-16 text-center">
            <p className="text-2xl font-bold text-gray-800">
              It’s time to choose (or not) your meat!
            </p>
            <p className="mt-1 text-gray-600">
              Some people love, some don’t. We have options for all tastes.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {renderOptions(proteins, 'proteinId', setSelectedProteinId)}
          </div>

          <div className="mt-16 text-center">
            <button
              type="submit"
              className="bg-secondary inline-flex cursor-pointer items-center gap-4 rounded-full px-8 py-4 font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!selectedBrothId || !selectedProteinId}
            >
              PLACE MY ORDER
              <Image
                src={whiteArrowRight}
                alt="arrow"
                className="h-auto w-auto"
              />
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
