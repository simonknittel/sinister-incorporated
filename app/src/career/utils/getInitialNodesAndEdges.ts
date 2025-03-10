import {
  FlowNodeType,
  type Flow,
  type FlowEdge,
  type FlowNode,
  type Role,
} from "@prisma/client";
import { getNodeTypeMarkdown } from "../components/nodes/getNodeTypeMarkdown";
import { getNodeTypeRole } from "../components/nodes/getNodeTypeRole";

export const getInitialNodesAndEdges = (
  flow: Flow & {
    nodes: (FlowNode & {
      sources: FlowEdge[];
      targets: FlowEdge[];
    })[];
  },
  roles: Role[],
  assignedRoles: (Role & {
    inherits: Role[];
  })[],
) => {
  const initialNodes = flow.nodes.map((node) => {
    switch (node.type) {
      case FlowNodeType.ROLE:
        return getNodeTypeRole(node, roles, assignedRoles);

      case FlowNodeType.MARKDOWN:
        return getNodeTypeMarkdown(node);

      default:
        throw new Error("Invalid node type");
    }
  });

  const uniqueEdges = new Map<FlowEdge["id"], FlowEdge>();
  for (const node of flow.nodes) {
    for (const source of node.sources) {
      uniqueEdges.set(source.id, source);
    }

    for (const target of node.targets) {
      uniqueEdges.set(target.id, target);
    }
  }
  const initialEdges = Array.from(uniqueEdges.values()).map((edge) => {
    const { sourceId, targetId, ...rest } = edge;

    return {
      source: sourceId,
      target: targetId,
      ...rest,
    };
  });

  return { initialNodes, initialEdges };
};
