'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, Upload } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { api } from '@/app/_lib/axios'

const editBrothSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.'),
  price: z
    .number({ message: 'Price is required.' })
    .gt(0, 'Price must be greater than 0.'),
  imageActive: z.any().optional(),
  imageInactive: z.any().optional(),
})

type EditBrothInputs = z.infer<typeof editBrothSchema>

interface BrothUpdatePayload {
  name: string
  description: string
  price: number
  imageActiveId?: string
  imageInactiveId?: string
}

interface Broth {
  id: string
  name: string
  description: string
  price: number
  imageActive: string
  imageInactive: string
}

export default function EditBrothPage() {
  const router = useRouter()
  const params = useParams()
  const brothId = params.brothId as string
  const queryClient = useQueryClient()

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
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditBrothInputs>({
    resolver: zodResolver(editBrothSchema),
  })

  const activeImageFile = useWatch({ control, name: 'imageActive' })
  const inactiveImageFile = useWatch({ control, name: 'imageInactive' })

  useEffect(() => {
    if (broth) {
      reset({
        name: broth.name,
        description: broth.description,
        price: broth.price,
      })
    }
  }, [broth, reset])

  const { mutate: updateBroth, isPending } = useMutation({
    mutationFn: async (data: EditBrothInputs) => {
      const updatePayload: BrothUpdatePayload = {
        name: data.name,
        description: data.description,
        price: data.price,
      }

      if (data.imageActive && data.imageActive.length > 0) {
        const activeFormData = new FormData()
        activeFormData.append('file', data.imageActive[0])
        const res = await api.post<{ imageId: string }>(
          '/images',
          activeFormData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        )
        updatePayload.imageActiveId = res.data.imageId
      }

      if (data.imageInactive && data.imageInactive.length > 0) {
        const inactiveFormData = new FormData()
        inactiveFormData.append('file', data.imageInactive[0])
        const res = await api.post<{ imageId: string }>(
          '/images',
          inactiveFormData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        )
        updatePayload.imageInactiveId = res.data.imageId
      }

      await api.put(`/broths/${brothId}`, updatePayload)
    },
    onSuccess: () => {
      alert('Broth updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['broths'] })
      router.push('/admin/broths')
    },
    onError: (error) => {
      console.error(error)
      alert('Error updating broth. Please try again.')
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
            <label
              htmlFor="imageActive"
              className="mb-2 block text-sm font-bold text-foreground"
            >
              New Active SVG (Optional)
            </label>
            <div
              className={`relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition-colors ${
                activeImageFile && activeImageFile.length > 0
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-background hover:border-primary'
              }`}
            >
              {activeImageFile && activeImageFile.length > 0 ? (
                <>
                  <CheckCircle2 className="mb-2 text-green-500" size={24} />
                  <span className="truncate px-4 text-center text-xs font-medium text-green-700">
                    {activeImageFile[0].name}
                  </span>
                </>
              ) : (
                <>
                  <Upload className="mb-2 text-primary" size={24} />
                  <span className="text-xs text-foreground/70">
                    Keep current or upload new
                  </span>
                </>
              )}
              <input
                id="imageActive"
                type="file"
                accept=".svg"
                className="absolute inset-0 z-50 size-full cursor-pointer opacity-0"
                disabled={isSubmitting}
                {...register('imageActive')}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="imageInactive"
              className="mb-2 block text-sm font-bold text-foreground"
            >
              New Inactive SVG (Optional)
            </label>
            <div
              className={`relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition-colors ${
                inactiveImageFile && inactiveImageFile.length > 0
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-background hover:border-primary'
              }`}
            >
              {inactiveImageFile && inactiveImageFile.length > 0 ? (
                <>
                  <CheckCircle2 className="mb-2 text-green-500" size={24} />
                  <span className="truncate px-4 text-center text-xs font-medium text-green-700">
                    {inactiveImageFile[0].name}
                  </span>
                </>
              ) : (
                <>
                  <Upload className="mb-2 text-primary" size={24} />
                  <span className="text-xs text-foreground/70">
                    Keep current or upload new
                  </span>
                </>
              )}
              <input
                id="imageInactive"
                type="file"
                accept=".svg"
                className="absolute inset-0 z-50 size-full cursor-pointer opacity-0"
                disabled={isSubmitting}
                {...register('imageInactive')}
              />
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
    </div>
  )
}
