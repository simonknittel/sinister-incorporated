import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  global_name: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});

export const memberSchema = z.object({
  nick: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});
