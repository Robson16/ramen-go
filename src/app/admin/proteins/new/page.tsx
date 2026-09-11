'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { ArrowLeft, CheckCircle2, ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { api } from '@/app/_lib/axios'
import { MediaPickerModal } from '@/app/admin/_components/MediaPickerModal'

const proteinSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.'),
  price: z
    .number({ message: 'Price is required.' })
    .gt(0, 'Price must be greater than 0.'),
  imageActiveId: z.string().min(1, 'Active image is required.'),
  imageInactiveId: z.string().min(1, 'Inactive image is required.'),
})

type ProteinInputs = z.infer<typeof proteinSchema>

export default function NewProteinPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [targetField, setTargetField] = useState<
    'imageActiveId' | 'imageInactiveId' | null
  >(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProteinInputs>({
    resolver: zodResolver(proteinSchema),
  })

  const activeImageId = useWatch({ control, name: 'imageActiveId' })
  const inactiveImageId = useWatch({ control, name: 'imageInactiveId' })

  const handleImageSelect = (image: { id: string }) => {
    if (targetField) {
      setValue(targetField, image.id, { shouldValidate: true })
    }
  }

  const { mutateAsync: createProtein, isPending } = useMutation({
    mutationFn: async (data: ProteinInputs) => {
      await api.post('admin/proteins', data)
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
          className="flex size-10 items-center justify-center rounded-full bg-background transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-foreground/70" />
        </Link>
        <h1 className="text-2xl font-black text-foreground">New Protein</h1>
      </div>

      <form
        onSubmit={handleSubmit(async (data) => {
          await createProtein(data)
        })}
        className="flex flex-col gap-6"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-foreground">
              Active Media
            </label>
            <input type="hidden" {...register('imageActiveId')} />
            <div
              onClick={() => {
                setTargetField('imageActiveId')
                setIsPickerOpen(true)
              }}
              className={`relative flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 transition-colors ${
                activeImageId
                  ? 'border-green-500 bg-green-50'
                  : errors.imageActiveId
                    ? 'border-red-400 bg-red-50'
                    : 'border-dashed border-gray-300 bg-background hover:border-primary'
              }`}
            >
              {activeImageId ? (
                <div className="flex flex-col items-center p-4">
                  <CheckCircle2 className="mb-2 text-green-500" size={32} />
                  <span className="text-center text-xs font-semibold text-green-700">
                    Media Selected!
                  </span>
                </div>
              ) : (
                <>
                  <ImageIcon
                    className={`mb-2 ${errors.imageActiveId ? 'text-red-400' : 'text-primary'}`}
                    size={32}
                  />
                  <span
                    className={`text-xs font-medium ${errors.imageActiveId ? 'text-red-500' : 'text-foreground/70'}`}
                  >
                    Select from Media Library
                  </span>
                </>
              )}
            </div>
            {errors.imageActiveId && (
              <span className="mt-1 block text-sm text-secondary">
                {errors.imageActiveId.message}
              </span>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-foreground">
              Inactive Media
            </label>
            <input type="hidden" {...register('imageInactiveId')} />
            <div
              onClick={() => {
                setTargetField('imageInactiveId')
                setIsPickerOpen(true)
              }}
              className={`relative flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 transition-colors ${
                inactiveImageId
                  ? 'border-green-500 bg-green-50'
                  : errors.imageInactiveId
                    ? 'border-red-400 bg-red-50'
                    : 'border-dashed border-gray-300 bg-background hover:border-primary'
              }`}
            >
              {inactiveImageId ? (
                <div className="flex flex-col items-center p-4">
                  <CheckCircle2 className="mb-2 text-green-500" size={32} />
                  <span className="text-center text-xs font-semibold text-green-700">
                    Media Selected!
                  </span>
                </div>
              ) : (
                <>
                  <ImageIcon
                    className={`mb-2 ${errors.imageInactiveId ? 'text-red-400' : 'text-primary'}`}
                    size={32}
                  />
                  <span
                    className={`text-xs font-medium ${errors.imageInactiveId ? 'text-red-500' : 'text-foreground/70'}`}
                  >
                    Select from Media Library
                  </span>
                </>
              )}
            </div>
            {errors.imageInactiveId && (
              <span className="mt-1 block text-sm text-secondary">
                {errors.imageInactiveId.message}
              </span>
            )}
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
            placeholder="Chashu"
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
            placeholder="Sliced pork belly..."
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
            placeholder="10.00"
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
            'SAVE PROTEIN'
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
