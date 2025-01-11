"use client";

import { type FlowNode, type Role, FlowNodeType } from "@prisma/client";

export const getNodeTypeRole = (
  node: FlowNode,
  roles: Role[],
  assignedRoles: Role[],
) => {
  const role = roles.find((role) => role.id === node.roleId);

  const data = role
    ? {
        role,
        roleImage: node.roleImage,
        backgroundColor: node.backgroundColor,
        backgroundTransparency: node.backgroundTransparency,
        unlocked: assignedRoles.some(
          (assignedRole) => assignedRole.id === role.id,
        ),
      }
    : { redacted: true };

  return {
    id: node.id,
    type: FlowNodeType.ROLE,
    position: {
      x: node.positionX,
      y: node.positionY,
    },
    data,
    width: node.width,
    height: node.height,
  };
};
