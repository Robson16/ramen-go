'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Loader2, Plus, UploadCloud } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'

import { api } from '@/app/_lib/axios'
import { env } from '@/app/env'

interface MediaImage {
  id: string
  title: string
  url: string
}

interface FetchGalleryResponse {
  images: MediaImage[]
}

export function MediaLibrary() {
  const [page, setPage] = useState(1)
  const [showDropzone, setShowDropzone] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['media-gallery', page],
    queryFn: async () => {
      const response = await api.get<FetchGalleryResponse>('/admin/images', {
        params: { page },
      })
      return response.data
    },
    placeholderData: (previousData) => previousData,
  })

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const uploadPromises = files.map((file) => {
        const formData = new FormData()
        formData.append('file', file)

        return api.post('/admin/images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      })

      await Promise.all(uploadPromises)
    },
    onSuccess: () => {
      toast.success('Images uploaded successfully!')
      setShowDropzone(false)
      queryClient.invalidateQueries({ queryKey: ['media-gallery'] })
    },
    onError: () => {
      toast.error('Failed to upload some images. Check formats and sizes.')
    },
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    if (files.length > 0) {
      uploadMutation.mutate(files)
    }
  }

  const images = data?.images ?? []

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-200">
        <Loader2 className="size-8 animate-spin text-secondary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-red-200 text-red-500">
        <AlertCircle className="mb-2 size-8" />
        <p>Failed to load media library.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Medias</h1>
        <button
          onClick={() => setShowDropzone((prev) => !prev)}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
        >
          <Plus
            size={20}
            className={
              showDropzone
                ? 'rotate-45 transition-transform'
                : 'transition-transform'
            }
          />
          {showDropzone ? 'CANCEL' : 'NEW MEDIA'}
        </button>
      </div>

      {showDropzone && (
        <div className="flex w-full items-center justify-center">
          <label
            htmlFor="dropzone-file"
            className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100 dark:hover:bg-gray-200 ${
              uploadMutation.isPending ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mb-4 size-10 animate-spin text-gray-500" />
                  <p className="text-sm text-gray-500">Uploading...</p>
                </>
              ) : (
                <>
                  <UploadCloud className="mb-4 size-10 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">SVG, PNG, JPG or JPEG</p>
                </>
              )}
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              accept=".svg, .png, .jpg, .jpeg"
              onChange={handleFileChange}
              disabled={uploadMutation.isPending}
              multiple
            />
          </label>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-secondary hover:shadow-md"
          >
            <Image
              src={`${env.NEXT_PUBLIC_IMAGES_BASE_URL}/${image.url}`}
              alt={image.title}
              fill
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
            />
            <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-black/60 p-2 text-xs text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="truncate">{image.title}</span>
            </div>
          </div>
        ))}
      </div>

      {images.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <button
            onClick={() => setPage((old) => Math.max(old - 1, 1))}
            disabled={page === 1}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button
            onClick={() => setPage((old) => old + 1)}
            disabled={images.length < 20}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {images.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-gray-500">
          <p>No media files found.</p>
        </div>
      )}
    </div>
  )
}
