'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { api } from '@/app/_lib/axios'
import { MediaPickerModal } from '@/app/admin/_components/MediaPickerModal'
import { env } from '@/app/env'

const editBrothSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.'),
  price: z
    .number({ message: 'Price is required.' })
    .gt(0, 'Price must be greater than 0.'),
  imageActiveId: z.string().optional(),
  imageInactiveId: z.string().optional(),
})

type EditBrothInputs = z.infer<typeof editBrothSchema>

interface MediaObject {
  id: string
  url: string
}

interface Broth {
  id: string
  name: string
  description: string
  price: number
  imageActive: MediaObject
  imageInactive: MediaObject
}

interface BrothUpdatePayload {
  name: string
  description: string
  price: number
  imageActiveId?: string
  imageInactiveId?: string
}

export default function EditBrothPage() {
  const router = useRouter()
  const params = useParams()
  const brothId = params.brothId as string
  const queryClient = useQueryClient()

  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [targetField, setTargetField] = useState<
    'imageActiveId' | 'imageInactiveId' | null
  >(null)

  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null)
  const [inactivePreviewUrl, setInactivePreviewUrl] = useState<string | null>(
    null,
  )

  const { data: broth, isLoading: isLoadingBroth } = useQuery({
    queryKey: ['broths'],
    queryFn: async () => {
      const response = await api.get<{ broths: Broth[] }>('/broths')
      return response.data.broths
    },
    select: (broths) => broths.find((broth) => broth.id === brothId),
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditBrothInputs>({
    resolver: zodResolver(editBrothSchema),
  })

  useEffect(() => {
    if (broth) {
      reset({
        name: broth.name,
        description: broth.description,
        price: broth.price,
      })
    }
  }, [broth, reset])

  const handleImageSelect = (image: { id: string; url: string }) => {
    if (targetField) {
      setValue(targetField, image.id, { shouldValidate: true })

      if (targetField === 'imageActiveId') {
        setActivePreviewUrl(image.url)
      } else if (targetField === 'imageInactiveId') {
        setInactivePreviewUrl(image.url)
      }
    }
  }

  const { mutate: updateBroth, isPending } = useMutation({
    mutationFn: async (data: EditBrothInputs) => {
      const updatePayload: BrothUpdatePayload = {
        name: data.name,
        description: data.description,
        price: data.price,
      }

      if (data.imageActiveId && data.imageActiveId.trim() !== '') {
        updatePayload.imageActiveId = data.imageActiveId
      }

      if (data.imageInactiveId && data.imageInactiveId.trim() !== '') {
        updatePayload.imageInactiveId = data.imageInactiveId
      }

      await api.put(`admin/broths/${brothId}`, updatePayload)
    },
    onSuccess: () => {
      toast.success('Broth updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['broths'] })
      router.push('/admin/broths')
    },
    onError: (error) => {
      console.error(error)
      toast.error('Error updating broth. Please try again.')
    },
  })

  if (isLoadingBroth) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
      </div>
    )
  }

  if (!broth) {
    return (
      <div className="py-10 text-center text-secondary">Broth not found.</div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/broths"
          className="flex size-10 items-center justify-center rounded-full bg-background transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-foreground/70" />
        </Link>
        <h1 className="text-2xl font-black text-foreground">Edit Broth</h1>
      </div>

      <form
        onSubmit={handleSubmit((data) => updateBroth(data))}
        className="flex flex-col gap-6"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-foreground">
              Active Media (Optional)
            </label>
            <input type="hidden" {...register('imageActiveId')} />
            <div
              onClick={() => {
                setTargetField('imageActiveId')
                setIsPickerOpen(true)
              }}
              className={`relative flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 transition-colors ${
                activePreviewUrl || broth?.imageActive?.url
                  ? 'border-green-500 bg-gray-400/20 hover:bg-green-50'
                  : 'border-dashed border-gray-300 bg-background hover:border-primary'
              }`}
            >
              {activePreviewUrl || broth?.imageActive?.url ? (
                <>
                  <Image
                    src={`${env.NEXT_PUBLIC_IMAGES_BASE_URL}/${activePreviewUrl || broth.imageActive.url}`}
                    alt="Current Active Image"
                    fill
                    className="object-contain p-4"
                  />
                  {activePreviewUrl && (
                    <div className="absolute top-2 left-2 rounded-md bg-green-500 px-2 py-1 text-[10px] font-bold text-white shadow">
                      NEW SELECTION
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black shadow-lg">
                      CHANGE MEDIA
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="mb-2 text-primary" size={32} />
                  <span className="text-xs font-medium text-foreground/70">
                    Select from Media Library
                  </span>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-foreground">
              Inactive Media (Optional)
            </label>
            <input type="hidden" {...register('imageInactiveId')} />
            <div
              onClick={() => {
                setTargetField('imageInactiveId')
                setIsPickerOpen(true)
              }}
              className={`relative flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 transition-colors ${
                inactivePreviewUrl || broth?.imageInactive?.url
                  ? 'border-green-500 bg-gray-400/20 hover:bg-green-50'
                  : 'border-dashed border-gray-300 bg-background hover:border-primary'
              }`}
            >
              {inactivePreviewUrl || broth?.imageInactive?.url ? (
                <>
                  <Image
                    src={`${env.NEXT_PUBLIC_IMAGES_BASE_URL}/${inactivePreviewUrl || broth.imageInactive.url}`}
                    alt="Current Inactive Image"
                    fill
                    className="object-contain p-4"
                  />
                  {inactivePreviewUrl && (
                    <div className="absolute top-2 left-2 rounded-md bg-green-500 px-2 py-1 text-[10px] font-bold text-white shadow">
                      NEW SELECTION
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black shadow-lg">
                      CHANGE MEDIA
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="mb-2 text-primary" size={32} />
                  <span className="text-xs font-medium text-foreground/70">
                    Select from Media Library
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-bold text-foreground"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            disabled={isSubmitting}
            {...register('name')}
          />
          {errors.name && (
            <span className="mt-1 block text-sm text-secondary">
              {errors.name.message}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-bold text-foreground"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-300 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            disabled={isSubmitting}
            {...register('description')}
          />
          {errors.description && (
            <span className="mt-1 block text-sm text-secondary">
              {errors.description.message}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="price"
            className="mb-1 block text-sm font-bold text-foreground"
          >
            Price (US$)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            disabled={isSubmitting}
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && (
            <span className="mt-1 block text-sm text-secondary">
              {errors.price.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-4 flex w-full justify-center rounded-lg bg-primary p-4 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? (
            <div className="size-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            'UPDATE BROTH'
          )}
        </button>
      </form>

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => {
          setIsPickerOpen(false)
          setTargetField(null)
        }}
        onSelect={handleImageSelect}
      />
    </div>
  )
}
