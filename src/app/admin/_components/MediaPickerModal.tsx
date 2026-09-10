'use client'

import { useQuery } from '@tanstack/react-query'
import { Loader2, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { api } from '@/app/_lib/axios'
import { env } from '@/app/env'

interface MediaImage {
  id: string
  title: string
  url: string
}

interface MediaPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (image: MediaImage) => void
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
}: MediaPickerModalProps) {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['media-gallery', page],
    queryFn: async () => {
      const response = await api.get<{ images: MediaImage[] }>(
        '/admin/images',
        {
          params: { page },
        },
      )
      return response.data
    },
    enabled: isOpen,
    placeholderData: (prev) => prev,
  })

  if (!isOpen) return null

  const images = data?.images ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h3 className="text-xl font-bold text-foreground">Select Media</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-secondary" />
            </div>
          ) : images.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-gray-500">
              No media found. Go to the Media Library to upload some!
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  onClick={() => {
                    onSelect(image)
                    onClose()
                  }}
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-all hover:border-secondary hover:shadow-md"
                >
                  <Image
                    src={`${env.NEXT_PUBLIC_IMAGES_BASE_URL}/${image.url}`}
                    alt={image.title}
                    fill
                    className="object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 33vw, 16vw"
                  />

                  <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-black/60 p-1 text-xs text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="truncate">{image.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {images.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 p-4">
            <button
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1}
              className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <button
              onClick={() => setPage((old) => old + 1)}
              disabled={images.length < 20}
              className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
