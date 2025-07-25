"use client";

import z from "zod";

export const schema = z.object({
  id: z.cuid2(),
  roleId: z.string(),
  backgroundColor: z.string(),
  backgroundTransparency: z.coerce.number().min(0).max(1),
});
