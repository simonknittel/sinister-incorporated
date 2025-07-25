"use client";

import { FlowNodeRoleImage } from "@prisma/client";
import z from "zod";

export const schema = z.object({
  id: z.cuid2(),
  roleId: z.string(),
  roleImage: z.nativeEnum(FlowNodeRoleImage),
  backgroundColor: z.string(),
  backgroundTransparency: z.coerce.number().min(0).max(1),
});
