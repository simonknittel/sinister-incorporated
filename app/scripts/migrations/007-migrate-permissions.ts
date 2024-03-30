/**
 * Usage:
 * ```bashrc
 * npm install --global ts-node
 *
 * ts-node --skipProject ./migrations/007-migrate-permissions.ts
 *
 * DATABASE_URL="..." ts-node --skipProject ./migrations/007-migrate-permissions.ts
 * ```
 */

import { prisma } from "../prisma";

async function main() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          attributes: true,
        },
      },
    },
  });

  for (const role of roles) {
    const permissionStrings: Array<string> = [];

    for (const permission of role.permissions) {
      let permissionString = `${permission.resource};${permission.operation}`;

      for (const attribute of permission.attributes) {
        permissionString += `;${attribute.key}=${attribute.value}`;
      }

      permissionStrings.push(permissionString);
    }

    await prisma.$transaction([
      prisma.permissionString.deleteMany({
        where: {
          roleId: role.id,
        },
      }),

      prisma.permissionString.createMany({
        data: permissionStrings.map((permissionString) => ({
          roleId: role.id,
          permissionString,
        })),
      }),
    ]);
  }
}

void main().then(() => console.info("Finished."));
