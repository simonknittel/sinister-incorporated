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

export const guildMemberResponseSchema = z.union([
  z.object({
    avatar: z.string().nullable(),
  }),

  z.object({
    message: z.string(),
  }),
]);

export const eventSchema = z.object({
  id: z.string(),
  guild_id: z.string(),
  name: z.string(),
  image: z.string().optional().nullable(),
  scheduled_start_time: z.coerce.date(),
  scheduled_end_time: z.coerce.date(),
  user_count: z.number(),
  description: z.string().optional(),
  entity_metadata: z.object({
    location: z.string().optional(),
  }),
});
