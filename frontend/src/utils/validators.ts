import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const profileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  username: z.string().optional(),
  email: emailSchema.optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  preferences: z.record(z.any()).optional(),
  customFields: z.record(z.any()).optional(),
});

export const ingestionSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  metadata: z.object({
    title: z.string().optional(),
    source: z.string().optional(),
    author: z.string().optional(),
  }).optional(),
});

export const querySchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  chatId: z.string().optional(),
  options: z.object({
    model: z.string().optional(),
    useRAG: z.boolean().optional(),
    useGraph: z.boolean().optional(),
    useHybrid: z.boolean().optional(),
    useIterative: z.boolean().optional(),
    maxIterations: z.number().optional(),
    confidenceThreshold: z.number().optional(),
    graphDepth: z.number().optional(),
    ragLimit: z.number().optional(),
    ragThreshold: z.number().optional(),
    processData: z.boolean().optional(),
  }).optional(),
});

