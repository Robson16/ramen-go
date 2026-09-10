'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { Loader2, Save, Trash2, X } from 'lucide-react'
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

interface MediaDetailsModalProps {
  image: MediaImage
  isOpen: boolean
  onClose: () => void
}

export function MediaDetailsModal({
  image,
  isOpen,
  onClose,
}: MediaDetailsModalProps) {
  const [title, setTitle] = useState(image.title)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/images/${image.id}`)
    },
    onSuccess: () => {
      toast.success('Image deleted successfully.')
      queryClient.invalidateQueries({ queryKey: ['media-gallery'] })
      onClose()
    },
    onError: (error: Error) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        toast.error('Cannot delete: Image is currently in use.')
      } else {
        toast.error('Failed to delete image.')
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (newTitle: string) => {
      await api.patch(`/admin/images/${image.id}`, { title: newTitle })
    },
    onSuccess: () => {
      toast.success('Title updated successfully.')
      queryClient.invalidateQueries({ queryKey: ['media-gallery'] })
      onClose()
    },
    onError: () => {
      toast.error('Failed to update title.')
    },
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row">
        <div className="relative flex h-64 items-center justify-center bg-gray-100 p-8 md:h-auto md:w-3/5">
          <div className="relative size-full">
            <Image
              src={`${env.NEXT_PUBLIC_IMAGES_BASE_URL}/${image.url}`} // Substitua pela sua URL real
              alt={image.title}
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="flex flex-col p-6 md:w-2/5">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">Media Details</h3>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                File URL
              </label>
              <input
                type="text"
                readOnly
                value={`${env.NEXT_PUBLIC_IMAGES_BASE_URL}/${image.url}`} // Substitua pela sua URL real
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-foreground focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-auto flex gap-3 pt-8">
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-3 text-red-600 hover:bg-red-100 disabled:opacity-50"
              title="Delete Image"
            >
              {deleteMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Trash2 size={20} />
              )}
            </button>

            <button
              onClick={() => updateMutation.mutate(title)}
              disabled={
                updateMutation.isPending ||
                title === image.title ||
                !title.trim()
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-3 font-bold text-white hover:bg-secondary/90 disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              SAVE CHANGES
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
