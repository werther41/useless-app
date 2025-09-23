import { z } from "zod"

// Install zod if not already installed: npm install zod
export const factSchema = z.object({
  id: z.string().min(1, "ID is required"),
  text: z.string().min(10, "Fact text must be at least 10 characters"),
  source: z.string().optional(),
  source_url: z.string().url().optional().or(z.literal("")),
})

export const ratingSchema = z.object({
  rating: z.union([z.literal(-1), z.literal(1)], {
    message: "Rating must be -1 (too useless) or 1 (useful uselessness)",
  }),
})

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})

export type FactInput = z.infer<typeof factSchema>
export type RatingInput = z.infer<typeof ratingSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
