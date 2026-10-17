import { createActor, type Actor } from "../actor.js";
import { getEffectiveRolesOfCitizen } from "../auth/getEffectiveRolesOfCitizen.js";
import type { ApplicationContext } from "../context.js";
import { requireMcpAccess } from "../mcpAccess.js";
import { withSpan } from "../withSpan.js";
import type { VerifiedAccessToken } from "./accessToken.js";
import { InvalidTokenError } from "./errors.js";

/** The app updates `lastUsedAt` of a grant at most one time in this interval */
const LAST_USED_AT_INTERVAL_IN_MILLISECONDS = 60 * 60 * 1000;

export interface PrincipalGrant {
  readonly id: string;
  readonly clientId: string;
  /** The client gives its name itself, thus the name is not trusted */
  readonly clientName: string;
  readonly createdAt: Date;
  /** Admin mode applies only when this is set and the user is an admin */
  readonly adminModeEnabledAt: Date | null;
}

export interface Principal {
  readonly actor: Actor;
  readonly grant: PrincipalGrant;
}

/**
 * Builds the actor of an MCP request from a verified access token. The
 * permissions are the own roles of the user, like in the session of the app.
 * Admin mode applies when the grant has it and the user is an admin.
 *
 * @throws InvalidTokenError when the grant is revoked or the user is banned
 * @throws ForbiddenError when the user does not have the clearance of the app
 * or the permission to use the MCP server
 */
export const resolvePrincipal = (
  context: ApplicationContext,
  token: VerifiedAccessToken,
): Promise<Principal> =>
  withSpan(context, "resolvePrincipal", async () => {
    const grant = await context.prisma.oAuthGrant.findUnique({
      where: { id: token.grantId },
      select: {
        id: true,
        userId: true,
        clientId: true,
        clientName: true,
        createdAt: true,
        lastUsedAt: true,
        revokedAt: true,
        adminModeEnabledAt: true,
        user: {
          select: {
            role: true,
            emailVerified: true,
            bannedAt: true,
            citizen: { select: { id: true, handle: true } },
            // The same account as the `discordId` of the session of the app
            accounts: {
              where: { provider: "discord" },
              select: { providerAccountId: true },
              take: 1,
            },
          },
        },
      },
    });

    if (
      !grant ||
      grant.revokedAt ||
      grant.userId !== token.userId ||
      grant.clientId !== token.clientId
    )
      throw new InvalidTokenError("The grant of the access token is revoked");

    const { user } = grant;
    if (user.bannedAt) throw new InvalidTokenError("The user is banned");

    const effectiveRoles = user.citizen
      ? await getEffectiveRolesOfCitizen(context.prisma, user.citizen.id)
      : null;

    const actor = createActor({
      userId: grant.userId,
      userRole: user.role,
      emailConfirmedAt: user.emailVerified,
      citizen: user.citizen,
      roleIds: effectiveRoles?.roleIds ?? new Set(),
      discordUserId: user.accounts[0]?.providerAccountId ?? null,
      permissionSets: effectiveRoles?.permissionSets ?? [],
      // `createActor()` applies admin mode only to an admin
      adminMode: grant.adminModeEnabledAt !== null,
    });

    actor.requireClearance();
    requireMcpAccess(actor);

    const now = context.now();
    const lastUsedAtThreshold = new Date(
      now.getTime() - LAST_USED_AT_INTERVAL_IN_MILLISECONDS,
    );
    if (!grant.lastUsedAt || grant.lastUsedAt < lastUsedAtThreshold)
      // The condition makes parallel requests write only one time
      await context.prisma.oAuthGrant.updateMany({
        where: {
          id: grant.id,
          OR: [
            { lastUsedAt: null },
            { lastUsedAt: { lt: lastUsedAtThreshold } },
          ],
        },
        data: { lastUsedAt: now },
      });

    return {
      actor,
      grant: {
        id: grant.id,
        clientId: grant.clientId,
        clientName: grant.clientName,
        createdAt: grant.createdAt,
        adminModeEnabledAt: grant.adminModeEnabledAt,
      },
    };
  });
