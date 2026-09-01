'use client'

import { useQuery } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { api } from '@/app/_lib/axios'
import { env } from '@/app/env'

interface Broth {
  id: string
  name: string
  description: string
  price: number
  imageActive: string
  imageInactive: string
}

export function BrothsTable() {
  const {
    data: broths,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['broths'],
    queryFn: async () => {
      const response = await api.get<{ broths: Broth[] }>('/broths')
      return response.data.broths
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
      </div>
    )
  }

  if (isError || !broths) {
    return (
      <div className="py-10 text-center text-secondary">
        Could not load broths. Please try again.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-left text-sm text-foreground">
        <thead className="bg-background text-xs text-foreground/70 uppercase">
          <tr>
            <th className="px-6 py-4">Image</th>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Description</th>
            <th className="px-6 py-4">Price</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {broths.map((broth) => (
            <tr
              key={broth.id}
              className="group border-b border-gray-200 transition-colors last:border-0 hover:bg-background/50"
            >
              <td className="px-6 py-4">
                <div className="relative flex size-16 items-center justify-center rounded-full bg-transparent shadow-sm transition-colors group-hover:bg-primary">
                  <Image
                    src={`${env.NEXT_PUBLIC_IMAGES_BASE_URL}/${broth.imageInactive}`}
                    alt={broth.name}
                    width={48}
                    height={48}
                    className="block object-cover group-hover:hidden"
                  />

                  <Image
                    src={`${env.NEXT_PUBLIC_IMAGES_BASE_URL}/${broth.imageActive}`}
                    alt={broth.name}
                    width={48}
                    height={48}
                    className="hidden object-cover group-hover:block"
                  />
                </div>
              </td>
              <td className="px-6 py-4 font-bold">{broth.name}</td>
              <td className="px-6 py-4 text-foreground/70">
                {broth.description}
              </td>
              <td className="px-6 py-4 font-bold text-secondary">
                US$ {broth.price}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-3">
                  <Link
                    href={`/admin/broths/${broth.id}/edit`}
                    className="text-primary transition-colors hover:text-primary/70"
                  >
                    <Pencil size={20} />
                  </Link>
                  <button className="text-secondary transition-colors hover:text-secondary/70">
                    <Trash2 size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {broths.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-8 text-center text-foreground/70"
              >
                No broths found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
