import { z } from 'zod'

export const configSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  apiToken: z.string().min(1, 'API token is required'),
  board: z.string().min(1, 'Board ID is required'),
  heading: z.string().default(''),
  ignoreArchived: z.boolean().default(true),
  recentActivityHours: z.number().positive().default(12),
  memberId: z.string().nullable().optional().default(null),
  lists: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      title: z.string().nullable().optional().default(null),
      mode: z.enum(['all', 'withRecentActivity']).default('withRecentActivity')
    })
  ).min(1, 'At least one list configuration is required')
})

export function validateConfig(config) {
  const result = configSchema.safeParse(config)

  if (!result.success) {
    console.error('Configuration validation failed:')
    console.error(z.prettifyError(result.error))
    process.exit(1)
  }

  return result.data
}
