import type { Prisma } from "@sam-monorepo/database/client";

/**
 * Takes the transaction lock of the wiki page tree. The trigger
 * `WikiPage_check_parent` takes the same lock when a page gets a new parent.
 * Put this statement first in each transaction that changes the tree (a move
 * or a new sort order of siblings): when the lock comes only from the trigger
 * after the first sibling updates, two moves can wait for each other.
 *
 * An insert (a new, a copied or a pasted page) does not take the lock: the
 * trigger checks the parent of a new row without it.
 *
 * The function is not `async`: it gives the `PrismaPromise`, thus a batch
 * `$transaction([...])` accepts it.
 */
export const lockWikiPageTree = (
  client: Pick<Prisma.TransactionClient, "$executeRaw">,
): Prisma.PrismaPromise<number> =>
  client.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('WikiPage_hierarchy'))`;
