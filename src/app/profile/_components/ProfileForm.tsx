'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { destroyCookie } from 'nookies'

import { api } from '@/app/_lib/axios'
import { useAuthStore } from '@/app/_store/auth'

interface UserProfile {
  user: {
    id: string
    name: string
    email: string
  }
}

export function ProfileForm() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const logout = useAuthStore((state) => state.logout)
  const updateUser = useAuthStore((state) => state.updateUser)

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get<UserProfile>('/profile')

      return response.data.user
    },
  })

  const updateProfile = useMutation({
    mutationFn: async (newName: string) => {
      await api.put('/profile', {
        name: newName,
      })
    },
    onSuccess: (_, newName) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })

      updateUser(newName)

      alert('Profile updated successfully!')
    },
    onError: () => {
      alert('Failed to update profile. Please try again.')
    },
  })

  const deleteAccount = useMutation({
    mutationFn: async () => {
      await api.delete('/profile')
    },
    onSuccess: () => {
      destroyCookie(undefined, '@ramenGo:accessToken')

      logout()

      router.push('/login')
    },
    onError: () => {
      alert('Failed to delete account. Please try again.')
    },
  })

  function handleSave(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const newName = formData.get('name') as string

    if (!newName || newName === profile?.name) return

    updateProfile.mutate(newName)
  }

  function handleDelete() {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.',
      )
    ) {
      deleteAccount.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="size-16 animate-spin rounded-full border-8 border-gray-200 border-t-primary" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="py-10 text-center">
        <p className="text-red-500">
          Could not load your profile. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-bold">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={profile.name}
            required
            className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-bold">
            Email
          </label>
          <input
            id="email"
            type="email"
            defaultValue={profile.email}
            disabled
            className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 p-3 text-gray-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="mt-4 rounded-full bg-primary px-8 py-4 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {updateProfile.isPending ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </form>

      <div className="mt-8 border-t border-gray-200 pt-8 text-center">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteAccount.isPending}
          className="text-sm font-bold text-red-500 transition-colors hover:text-red-700 disabled:opacity-50"
        >
          {deleteAccount.isPending ? 'DELETING...' : 'Delete my account'}
        </button>
      </div>
    </div>
  )
}
