'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { ArrowLeft, CheckCircle2, Upload } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { api } from '@/app/_lib/axios'

const imageFileSchema = (label: 'Active' | 'Inactive') =>
  z
    .custom<FileList>(
      (value): value is FileList =>
        value instanceof FileList && value.length === 1,
      { message: `${label} image is required.` },
    )
    .refine(
      (files) => files[0]?.type === 'image/svg+xml',
      'Only SVG files are allowed.',
    )

const proteinSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.'),
  price: z
    .number({ message: 'Price is required.' })
    .gt(0, 'Price must be greater than 0.'),
  imageActive: imageFileSchema('Active'),
  imageInactive: imageFileSchema('Inactive'),
})

type ProteinInputs = z.infer<typeof proteinSchema>

export default function NewProteinPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProteinInputs>({
    resolver: zodResolver(proteinSchema),
  })

  const activeImageFile = useWatch({
    control,
    name: 'imageActive',
  })

  const inactiveImageFile = useWatch({
    control,
    name: 'imageInactive',
  })

  const { mutateAsync: createProtein, isPending } = useMutation({
    mutationFn: async (data: ProteinInputs) => {
      const activeImageFormData = new FormData()
      activeImageFormData.append('file', data.imageActive[0])
      const activeRes = await api.post<{ imageId: string }>(
        'admin/images',
        activeImageFormData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )
      const imageActiveId = activeRes.data.imageId

      const inactiveImageFormData = new FormData()
      inactiveImageFormData.append('file', data.imageInactive[0])
      const inactiveRes = await api.post<{ imageId: string }>(
        'admin/images',
        inactiveImageFormData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )
      const imageInactiveId = inactiveRes.data.imageId

      await api.post('admin/proteins', {
        name: data.name,
        description: data.description,
        price: data.price,
        imageActiveId,
        imageInactiveId,
      })
    },
    onSuccess: () => {
      toast.success('Protein created successfully!')
      queryClient.invalidateQueries({ queryKey: ['proteins'] })
      router.push('/admin/proteins')
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        toast.error(
          error.response?.data?.message ||
            'An item with this name already exists.',
        )
        return
      }

      console.error(error)
      toast.error('Error creating protein. Please try again.')
    },
  })

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/proteins"
          className="bg-background flex size-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-foreground/70" />
        </Link>
        <h1 className="text-foreground text-2xl font-black">New Protein</h1>
      </div>

      <form
        onSubmit={handleSubmit(async (data) => {
          await createProtein(data)
        })}
        className="flex flex-col gap-6"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="imageActive"
              className="text-foreground mb-2 block text-sm font-bold"
            >
              Active SVG Image
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
                    Click to upload SVG
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
            {errors.imageActive && (
              <span className="text-secondary mt-1 block text-sm">
                {errors.imageActive.message as string}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="imageInactive"
              className="text-foreground mb-2 block text-sm font-bold"
            >
              Inactive SVG Image
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
                    Click to upload SVG
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
            {errors.imageInactive && (
              <span className="text-secondary mt-1 block text-sm">
                {errors.imageInactive.message as string}
              </span>
            )}
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
            placeholder="Chashu"
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
            placeholder="Sliced pork belly..."
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
            placeholder="10.00"
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
            'SAVE PROTEIN'
          )}
        </button>
      </form>
    </div>
  )
}
