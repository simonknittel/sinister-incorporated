import { FlowNodeType } from "@prisma/client";
import { createManyMapping } from "./createManyMapping";
import { updateFlowSchema } from "./updateFlowSchema";

export const roleNode = {
  enum: FlowNodeType.ROLE,
  updateFlowSchema,
  createManyMapping,
} as const;
