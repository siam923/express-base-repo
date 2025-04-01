import { z } from 'zod';

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  commissionRate: z.number()
    .min(0, "Commission rate cannot be negative")
    .max(100, "Commission rate cannot exceed 100")
    .optional(),
  parent: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid parent category ID").nullable().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();
