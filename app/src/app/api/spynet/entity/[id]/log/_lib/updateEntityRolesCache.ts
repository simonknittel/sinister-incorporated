import { prisma } from "~/server/db";

export const updateEntityRolesCache = async (entityId: string) => {
  const entity = await prisma.entity.findUnique({
    where: {
      id: entityId,
    },
    include: {
      logs: {
        where: {
          type: {
            in: ["role-added", "role-removed"],
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!entity) throw new Error("Internal server error");

  const assignedRoles = new Set<string>();

  for (const log of entity.logs) {
    if (!log.content) continue;

    if (log.type === "role-added") {
      assignedRoles.add(log.content);
    } else if (log.type === "role-removed") {
      assignedRoles.delete(log.content);
    }
  }

  await prisma.entity.update({
    where: {
      id: entityId,
    },
    data: {
      roles: Array.from(assignedRoles).join(","),
    },
  });
};
