'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

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
  const queryClient = useQueryClient()

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

  const { mutate: deleteBroth, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`admin/broths/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broths'] })
    },
    onError: (error) => {
      console.error(error)
      toast.error('Error deleting broth. It might be linked to an order.')
    },
  })

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteBroth(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="border-t-primary size-10 animate-spin rounded-full border-4 border-gray-200" />
      </div>
    )
  }

  if (isError || !broths) {
    return (
      <div className="text-secondary py-10 text-center">
        Could not load broths. Please try again.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="text-foreground w-full text-left text-sm">
        <thead className="bg-background text-foreground/70 text-xs uppercase">
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
              className="group hover:bg-background/50 border-b border-gray-200 transition-colors last:border-0"
            >
              <td className="px-6 py-4">
                <div className="group-hover:bg-primary relative flex size-16 items-center justify-center rounded-full bg-transparent shadow-sm transition-colors">
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
              <td className="text-foreground/70 px-6 py-4">
                {broth.description}
              </td>
              <td className="text-secondary px-6 py-4 font-bold">
                US$ {broth.price}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-3">
                  <Link
                    href={`/admin/broths/${broth.id}/edit`}
                    className="text-primary hover:text-primary/70 transition-colors"
                  >
                    <Pencil size={20} />
                  </Link>
                  <button
                    onClick={() => handleDelete(broth.id, broth.name)}
                    disabled={isDeleting}
                    className="text-secondary hover:text-secondary/70 transition-colors"
                  >
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
                className="text-foreground/70 px-6 py-8 text-center"
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
