"use client";

import { FlowNodeType } from "@prisma/client";
import { CreateOrUpdateForm } from "./CreateOrUpdateForm";
import { getNodeType } from "./getNodeType";
import { Node } from "./Node";

export const markdownNode = {
  enum: FlowNodeType.MARKDOWN,
  getNodeType,
  Node,
  CreateOrUpdateForm,
} as const;
