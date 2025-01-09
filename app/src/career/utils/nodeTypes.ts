import { FlowNodeType } from "@prisma/client";
import { RoleNode } from "../components/RoleNode";

export const nodeTypes = { [FlowNodeType.ROLE]: RoleNode };
