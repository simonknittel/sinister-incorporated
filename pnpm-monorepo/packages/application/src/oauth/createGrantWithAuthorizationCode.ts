import { AuditEventType } from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";
import { AUTHORIZATION_CODE_LIFETIME_IN_MILLISECONDS } from "./constants.js";
import type { ClientMetadata } from "./resolveClientMetadata.js";
import { createOpaqueToken, hashOpaqueToken } from "./secrets.js";

/**
 * The fields of a valid authorization request. Give only the result of
 * `validateAuthorizationRequest()`.
 */
export interface CreateGrantWithAuthorizationCodeInput {
  readonly client: Pick<ClientMetadata, "clientId" | "clientName">;
  readonly redirectUri: string;
  readonly codeChallenge: string;
  readonly scope: string;
  readonly resource: string;
}

export interface CreateGrantWithAuthorizationCodeOutput {
  readonly grantId: string;
  /** Give it only to the redirect URI. Never log it. */
  readonly code: string;
}

/**
 * The host of the redirect URI for the list of the connected clients. A
 * private-use scheme of a native app has no host, thus the list shows the
 * scheme.
 */
const getRedirectHost = (redirectUri: string) => {
  const url = new URL(redirectUri);

  return url.hostname || url.protocol.replace(/:$/, "");
};

/**
 * Records the consent of the user: a new grant (the connected client) and
 * its authorization code. Each consent gives a new grant, also for a client
 * that the user connected before.
 */
export const createGrantWithAuthorizationCode = (
  context: ApplicationContext,
  actor: Actor,
  input: CreateGrantWithAuthorizationCodeInput,
): Promise<CreateGrantWithAuthorizationCodeOutput> =>
  withSpan(context, "createGrantWithAuthorizationCode", async () => {
    actor.requireClearance();

    const code = createOpaqueToken();
    const now = context.now();

    const grant = await context.prisma.$transaction(async (transaction) => {
      const grant = await transaction.oAuthGrant.create({
        data: {
          userId: actor.userId,
          clientId: input.client.clientId,
          clientName: input.client.clientName,
          redirectHost: getRedirectHost(input.redirectUri),
          scope: input.scope,
          resource: input.resource,
        },
        select: { id: true },
      });

      await transaction.oAuthAuthorizationCode.create({
        data: {
          codeHash: hashOpaqueToken(code),
          clientId: input.client.clientId,
          redirectUri: input.redirectUri,
          codeChallenge: input.codeChallenge,
          scope: input.scope,
          resource: input.resource,
          userId: actor.userId,
          grantId: grant.id,
          expiresAt: new Date(
            now.getTime() + AUTHORIZATION_CODE_LIFETIME_IN_MILLISECONDS,
          ),
        },
        select: { id: true },
      });

      return grant;
    });

    await context.audit.create([
      {
        type: AuditEventType.OAUTH_GRANT_CREATED,
        data: {
          grantId: grant.id,
          clientId: input.client.clientId,
          clientName: input.client.clientName,
        },
        createdById: actor.userId,
      },
    ]);

    return { grantId: grant.id, code };
  });
