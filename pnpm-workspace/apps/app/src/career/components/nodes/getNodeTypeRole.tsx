"use client";

import { type FlowNode, type Role, FlowNodeType } from "@prisma/client";

export const getNodeTypeRole = (
  node: FlowNode,
  roles: Role[],
  assignedRoles: (Role & {
    inherits: Role[];
  })[],
) => {
  const role = roles.find((role) => role.id === node.roleId);

  const data = role
    ? {
        role,
        roleImage: node.roleImage,
        backgroundColor: node.backgroundColor,
        backgroundTransparency: node.backgroundTransparency,
        unlocked: isUnlocked(role, assignedRoles),
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

export const isUnlocked = (
  role: Pick<Role, "id">,
  assignedRoles: (Pick<Role, "id"> & { inherits: Pick<Role, "id">[] })[],
) => {
  return assignedRoles.some((assignedRole) => {
    if (assignedRole.id === role.id) return true;

    if (assignedRole.inherits.length > 0)
      return assignedRole.inherits.some(
        (inheritedRole) => inheritedRole.id === role.id,
      );

    return false;
  });
};
