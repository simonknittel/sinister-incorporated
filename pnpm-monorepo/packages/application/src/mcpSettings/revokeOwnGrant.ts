import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { revokeGrant } from "../oauth/revokeGrant.js";
import { withSpan } from "../withSpan.js";

export const revokeOwnGrantInputSchema = z.object({
  grantId: z.cuid2(),
});

/**
 * Disconnects a client of the actor: revokes the grant, deletes its refresh
 * tokens and writes the audit event. The next MCP request with an access
 * token of the grant gets `401`.
 *
 * @throws NotFoundError when the grant does not belong to the actor or is
 * already revoked
 */
export const revokeOwnGrant = (
  context: ApplicationContext,
  actor: Actor,
  input: z.infer<typeof revokeOwnGrantInputSchema>,
): Promise<void> =>
  withSpan(context, "revokeOwnGrant", async () => {
    const grant = await context.prisma.oAuthGrant.findFirst({
      where: { id: input.grantId, userId: actor.userId, revokedAt: null },
      select: { id: true, clientId: true },
    });
    if (!grant) throw new NotFoundError("The grant does not exist");

    const isRevoked = await revokeGrant(context, {
      grantId: grant.id,
      clientId: grant.clientId,
      revokedById: actor.userId,
      auditCreatedById: actor.userId,
    });

    // A parallel request revoked the grant first
    if (!isRevoked) throw new NotFoundError("The grant does not exist");
  });
