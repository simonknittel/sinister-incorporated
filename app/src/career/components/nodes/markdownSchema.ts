"use client";

import { FlowNodeMarkdownPosition, FlowNodeType } from "@prisma/client";
import { z } from "zod";

export const markdownSchema = z.object({
  id: z.string().cuid2(),
  nodeType: z.literal(FlowNodeType.MARKDOWN),
  markdown: z.string(),
  markdownPosition: z.nativeEnum(FlowNodeMarkdownPosition),
  backgroundColor: z.string(),
  backgroundTransparency: z.coerce.number().min(0).max(1),
});
