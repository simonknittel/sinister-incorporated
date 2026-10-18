import type { PrismaClientType } from "@sam-monorepo/database";
import type { Prisma } from "@sam-monorepo/database/client";

/**
 * Deletes the permission strings that refer to one object through the
 * attribute `<key>=<id>`, for example `otherRole;assign;roleId=<id>`. After
 * the object is deleted, such a string grants nothing. Run it in the same
 * transaction as the delete of the object.
 *
 * The function has no permission check: the caller deletes the object and
 * checks its permission. It is not `async`: it gives the `PrismaPromise`,
 * thus a batch `$transaction([...])` accepts it. The client is the client of
 * the app (a batch transaction) or a transaction client.
 */
export const deletePermissionStringsReferencing = (
  client: Pick<PrismaClientType, "permissionString">,
  key: string,
  id: string,
): Prisma.PrismaPromise<Prisma.BatchPayload> =>
  client.permissionString.deleteMany({
    where: {
      OR: [
        { permissionString: { contains: `;${key}=${id};` } },
        { permissionString: { endsWith: `;${key}=${id}` } },
      ],
    },
  });
