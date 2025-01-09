import {
  FlowNodeType,
  type Flow,
  type FlowEdge,
  type FlowNode,
  type Role,
} from "@prisma/client";

export const getInitialNodesAndEdges = (
  flow: Flow & {
    nodes: (FlowNode & {
      sources: FlowEdge[];
      targets: FlowEdge[];
    })[];
  },
  roles: Role[],
) => {
  const initialNodes = flow.nodes.map((node) => {
    switch (node.type) {
      case FlowNodeType.ROLE:
        return getNodeTypeRole(node, roles);

      // TODO: image

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

const getNodeTypeRole = (node: FlowNode, roles: Role[]) => {
  const role = roles.find((role) => role.id === node.roleId);
  if (!role) throw new Error("Role not found");

  return {
    id: node.id,
    type: FlowNodeType.ROLE,
    position: {
      x: node.positionX,
      y: node.positionY,
    },
    data: {
      role,
      roleImage: node.roleImage,
      backgroundColor: node.backgroundColor,
      backgroundTransparency: node.backgroundTransparency,
    },
    width: node.width,
    height: node.height,
  };
};
