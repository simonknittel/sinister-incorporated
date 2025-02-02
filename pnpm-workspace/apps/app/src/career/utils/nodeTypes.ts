import { FlowNodeType } from "@prisma/client";
import { MarkdownNode } from "../components/nodes/MarkdownNode";
import { RoleNode } from "../components/nodes/RoleNode";

export const nodeTypes = {
  [FlowNodeType.ROLE]: RoleNode,
  [FlowNodeType.MARKDOWN]: MarkdownNode,
};
