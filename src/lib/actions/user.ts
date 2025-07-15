'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const UserCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().nullable(),
  password: z.string().min(6),
  settings: z.any().optional(),
})

const UserUpdateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().nullable().optional(),
  password: z.string().min(6).optional(),
  settings: z.any().optional(),
})

export async function getUsers({
  page = 1,
  perPage = 10,
  orderBy = 'id',
  order = 'asc',
  search,
}: {
  page?: number
  perPage?: number
  orderBy?: string
  order?: 'asc' | 'desc'
  search?: string
}) {
  const skip = (page - 1) * perPage

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: perPage,
      where,
      orderBy: { [orderBy]: order },
      include: {
        posts: {
          select: { id: true },
        },
        profile: {
          select: { id: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  return {
    data: users,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  }
}

export async function getUser(id: number) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      posts: true,
      profile: true,
    },
  })
}

export async function createUser(data: FormData) {
  const formData: Record<string, any> = Object.fromEntries(data)
  
  // Parse settings JSON if provided
  if (formData.settings && typeof formData.settings === 'string') {
    try {
      formData.settings = JSON.parse(formData.settings)
    } catch {
      formData.settings = {}
    }
  }

  const validated = UserCreateSchema.parse(formData)

  await prisma.user.create({
    data: validated,
  })

  revalidatePath('/admin/user')
}

export async function updateUser(id: number, data: FormData) {
  const formData: Record<string, any> = Object.fromEntries(data)
  
  // Remove empty password field
  if (formData.password === '') {
    delete formData.password
  }
  
  // Parse settings JSON if provided
  if (formData.settings && typeof formData.settings === 'string') {
    try {
      formData.settings = JSON.parse(formData.settings)
    } catch {
      formData.settings = {}
    }
  }

  const validated = UserUpdateSchema.parse(formData)

  await prisma.user.update({
    where: { id },
    data: validated,
  })

  revalidatePath('/admin/user')
  revalidatePath(`/admin/user/${id}`)
}

export async function deleteUser(id: number) {
  await prisma.user.delete({
    where: { id },
  })

  revalidatePath('/admin/user')
}