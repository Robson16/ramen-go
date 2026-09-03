'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, Upload } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { api } from '@/app/_lib/axios'

const editProteinSchema = z.object({
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

type EditProteinInputs = z.infer<typeof editProteinSchema>

interface ProteinUpdatePayload {
  name: string
  description: string
  price: number
  imageActiveId?: string
  imageInactiveId?: string
}

interface Protein {
  id: string
  name: string
  description: string
  price: number
  imageActive: string
  imageInactive: string
}

export default function EditProteinPage() {
  const router = useRouter()
  const params = useParams()
  const proteinId = params.proteinId as string
  const queryClient = useQueryClient()

  const { data: protein, isLoading: isLoadingProtein } = useQuery({
    queryKey: ['proteins'],
    queryFn: async () => {
      const response = await api.get<{ proteins: Protein[] }>('admin/proteins')
      return response.data.proteins
    },
    select: (proteins) => proteins.find((protein) => protein.id === proteinId),
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProteinInputs>({
    resolver: zodResolver(editProteinSchema),
  })

  const activeImageFile = useWatch({ control, name: 'imageActive' })
  const inactiveImageFile = useWatch({ control, name: 'imageInactive' })

  useEffect(() => {
    if (protein) {
      reset({
        name: protein.name,
        description: protein.description,
        price: protein.price,
      })
    }
  }, [protein, reset])

  const { mutate: updateProtein, isPending } = useMutation({
    mutationFn: async (data: EditProteinInputs) => {
      const updatePayload: ProteinUpdatePayload = {
        name: data.name,
        description: data.description,
        price: data.price,
      }

      if (data.imageActive && data.imageActive.length > 0) {
        const activeFormData = new FormData()
        activeFormData.append('file', data.imageActive[0])
        const res = await api.post<{ imageId: string }>(
          'admin/images',
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
          'admin/images',
          inactiveFormData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        )
        updatePayload.imageInactiveId = res.data.imageId
      }

      await api.put(`admin/proteins/${proteinId}`, updatePayload)
    },
    onSuccess: () => {
      toast.success('Protein updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['proteins'] })
      router.push('/admin/proteins')
    },
    onError: (error) => {
      console.error(error)
      toast.error('Error updating protein. Please try again.')
    },
  })

  if (isLoadingProtein) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-t-primary size-10 animate-spin rounded-full border-4 border-gray-200" />
      </div>
    )
  }

  if (!protein) {
    return (
      <div className="text-secondary py-10 text-center">Protein not found.</div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/proteins"
          className="bg-background flex size-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-foreground/70" />
        </Link>
        <h1 className="text-foreground text-2xl font-black">Edit Protein</h1>
      </div>

      <form
        onSubmit={handleSubmit((data) => updateProtein(data))}
        className="flex flex-col gap-6"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="imageActive"
              className="text-foreground mb-2 block text-sm font-bold"
            >
              New Active SVG (Optional)
            </label>
            <div
              className={`relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition-colors ${
                activeImageFile && activeImageFile.length > 0
                  ? 'border-green-500 bg-green-50'
                  : 'bg-background hover:border-primary border-gray-300'
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
                  <Upload className="text-primary mb-2" size={24} />
                  <span className="text-foreground/70 text-xs">
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
              className="text-foreground mb-2 block text-sm font-bold"
            >
              New Inactive SVG (Optional)
            </label>
            <div
              className={`relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition-colors ${
                inactiveImageFile && inactiveImageFile.length > 0
                  ? 'border-green-500 bg-green-50'
                  : 'bg-background hover:border-primary border-gray-300'
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
                  <Upload className="text-primary mb-2" size={24} />
                  <span className="text-foreground/70 text-xs">
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
            className="text-foreground mb-1 block text-sm font-bold"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            className="focus:border-primary focus:ring-primary w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-1"
            disabled={isSubmitting}
            {...register('name')}
          />
          {errors.name && (
            <span className="text-secondary mt-1 block text-sm">
              {errors.name.message}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="text-foreground mb-1 block text-sm font-bold"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="focus:border-primary focus:ring-primary w-full resize-none rounded-lg border border-gray-300 p-3 outline-none focus:ring-1"
            disabled={isSubmitting}
            {...register('description')}
          />
          {errors.description && (
            <span className="text-secondary mt-1 block text-sm">
              {errors.description.message}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="price"
            className="text-foreground mb-1 block text-sm font-bold"
          >
            Price (US$)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            className="focus:border-primary focus:ring-primary w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-1"
            disabled={isSubmitting}
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && (
            <span className="text-secondary mt-1 block text-sm">
              {errors.price.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-primary mt-4 flex w-full justify-center rounded-lg p-4 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? (
            <div className="size-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            'UPDATE PROTEIN'
          )}
        </button>
      </form>
    </div>
  )
}
