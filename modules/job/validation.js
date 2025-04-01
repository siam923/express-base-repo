// validation.js
import { z } from 'zod';

// Schema for skill object
const skillSchema = z.object({
  skillType: z.string().optional(),
  name: z.string().min(1, "Skill name is required").optional(),
  isMandatory: z.boolean().default(true),
});

// Base schema with common fields
const jobBaseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  department: z.string().optional(),
  sender: z.string().optional(),
  referenceId: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(['draft', 'published', 'closed', 'archived']).default('draft'),
  jobCode: z.string().optional(),
  jobId: z.string().optional(),
  source: z.string().default('other'),
  primaryRecruiter: z.string().optional(),
  skills: z.array(skillSchema).optional().default([]),
  applicationEmail: z.string().email("Invalid email address").optional(),
  applicationDeadline: z.string()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: "Application deadline must be a valid date"
    })
    .optional()
    .transform(val => val ? new Date(val) : undefined),
});

// Create schema - title and description are required unless draft
const createJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  department: z.string().optional(),
  sender: z.string().optional(),
  referenceId: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  status: z.enum(['draft', 'published', 'closed', 'archived']).default('draft'),
  jobCode: z.string().optional(),
  jobId: z.string().optional(),
  source: z.string().default('other'),
  primaryRecruiter: z.string().optional(),
  skills: z.array(skillSchema).optional().default([]),
  applicationEmail: z.string().email("Invalid email address").optional(),
  applicationDeadline: z.string()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: "Application deadline must be a valid date"
    })
    .optional()
    .transform(val => val ? new Date(val) : undefined),
}).refine(data => {
  // If status is not draft, title and description are required
  if (data.status !== 'draft') {
    return data.title && data.description;
  }
  return true;
}, {
  message: "Title and description are required for non-draft jobs",
  path: ['title', 'description']
});

// Update schema (all fields optional)
const updateJobSchema = jobBaseSchema.partial();

// Get by ID schema
const getJobByIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID format"),
});

// Query schema for filtering jobs
const queryJobSchema = z.object({
  status: z.enum(['draft', 'published', 'closed', 'archived']).optional(),
  title: z.string().optional(),
  source: z.string().optional(),
  primaryRecruiter: z.string().optional(),
  createdFrom: z.string()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: "Created from date must be a valid date"
    })
    .optional(),
  createdTo: z.string()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: "Created to date must be a valid date"
    })
    .optional(),
  page: z.string().optional().transform(val => parseInt(val || '1')),
  limit: z.string().optional().transform(val => parseInt(val || '10')),
  sort: z.string().optional().default('-createdAt'),
});

export const jobValidation = {
  create: createJobSchema,
  update: updateJobSchema,
  getById: getJobByIdSchema,
  query: queryJobSchema,
};