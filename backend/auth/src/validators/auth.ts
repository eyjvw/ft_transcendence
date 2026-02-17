import { z } from "zod";

export const loginSchema = z.object({
	email: z.union([z.email(), z.string().min(3).max(32)]),
	password: z.string().min(6)
});

export const registerSchema = z.object({
	username: z.string().min(3).max(32),
	email: z.email(),
	password: z.string().min(6),
});

export const updateSchema = z.object({
	username: z.string().min(3).max(32),
	avatar_url: z.url(),
	bio: z.string().optional(),
	language: z.enum(["en", "fr", "es", "de"]).optional()
});

export const emailUpdateSchema = z.object({
	email: z.email()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type EmailUpdateInput = z.infer<typeof emailUpdateSchema>;