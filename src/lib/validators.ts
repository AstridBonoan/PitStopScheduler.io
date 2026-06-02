import { z } from 'zod'

export const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z
    .number({ error: 'Year is required' })
    .int()
    .min(1980, 'Year must be 1980 or later')
    .max(new Date().getFullYear() + 1, 'Invalid year'),
  mileage: z.number({ error: 'Mileage is required' }).int().min(0, 'Mileage must be positive'),
  licensePlate: z.string().optional(),
})

export const customerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .regex(/^[\d\s\-+()]+$/, 'Invalid phone format'),
  email: z.string().email('Enter a valid email'),
  notes: z.string().max(500, 'Notes must be under 500 characters').optional(),
})

export const adminLoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type VehicleFormData = z.infer<typeof vehicleSchema>
export type CustomerFormData = z.infer<typeof customerSchema>
