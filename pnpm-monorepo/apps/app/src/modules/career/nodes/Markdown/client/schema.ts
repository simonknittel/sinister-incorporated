"use client";

import { FlowNodeMarkdownPosition } from "@sam-monorepo/database/browser";
import { MAXIMUM_FLOW_MARKDOWN_LENGTH } from "@sam-monorepo/domain";
import * as z from "zod/mini";

export const schema = z.object({
  markdown: z.string().check(z.maxLength(MAXIMUM_FLOW_MARKDOWN_LENGTH)),
  markdownPosition: z.enum(FlowNodeMarkdownPosition),
  backgroundColor: z.string(),
  backgroundTransparency: z.coerce.number().check(z.gte(0), z.lte(1)),
});
