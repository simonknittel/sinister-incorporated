import { FlowNodeType } from "@prisma/client";
import { RoleNode } from "../components/nodes/RoleNode";

export const nodeTypes = { [FlowNodeType.ROLE]: RoleNode };
