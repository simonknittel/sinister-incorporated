"use client";

import { FlowNodeRoleImage, FlowNodeType } from "@prisma/client";
import { z } from "zod";

export const roleSchema = z.object({
  id: z.string().cuid2(),
  nodeType: z.literal(FlowNodeType.ROLE),
  roleId: z.string(),
  roleImage: z.nativeEnum(FlowNodeRoleImage),
  backgroundColor: z.string(),
  backgroundTransparency: z.coerce.number().min(0).max(1),
});
