"use client";

import { FlowNodeType } from "@prisma/client";
import { CreateOrUpdateForm } from "./CreateOrUpdateForm";
import { getNodeType } from "./getNodeType";
import { Node } from "./Node";

export const roleNode = {
  enum: FlowNodeType.ROLE,
  getNodeType,
  Node,
  CreateOrUpdateForm,
} as const;
