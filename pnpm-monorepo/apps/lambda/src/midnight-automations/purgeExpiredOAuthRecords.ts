import { prisma } from "@sam-monorepo/database";
import { AuditEventType } from "@sam-monorepo/domain";
import { createAuditEvents } from "../common/audit";
import { log } from "../common/logger";
import { captureAsyncFunc } from "../common/xray";

/**
 * The lifetime of an authorization code: 10 minutes. The same value as
 * `AUTHORIZATION_CODE_LIFETIME_IN_MILLISECONDS` of the application package.
 */
const AUTHORIZATION_CODE_LIFETIME_IN_MILLISECONDS = 10 * 60 * 1000;

/** 24 hours after its expiry, a cached client metadata document is deleted */
const CLIENT_METADATA_RETENTION_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

/**
 * Deletes the OAuth records of the MCP server that grant nothing anymore:
 *
 * - Expired authorization codes that the client did not redeem. A used code
 *   stays with its grant, thus its reuse still revokes the grant.
 * - Expired refresh tokens. A used refresh token expires 31 days after its
 *   issue, like an unused one. Until then, its reuse revokes the grant.
 * - Grants without a refresh token and without an unexpired code: grants of
 *   an abandoned or failed authorization, revoked grants and grants whose
 *   tokens all expired. Their codes are deleted with them.
 * - Cached client metadata documents that expired more than 24 hours ago.
 *   The app does not use an expired document: the next consent of the
 *   client fetches the document again.
 *
 * Plain Prisma code, because the Lambda does not depend on the application
 * package yet. It moves into a use case of the application package together
 * with the other automations.
 */
export const purgeExpiredOAuthRecords = async () => {
  await captureAsyncFunc("purgeExpiredOAuthRecords", async () => {
    const now = new Date();

    const { count: authorizationCodeCount } = await captureAsyncFunc(
      "delete expired OAuth authorization codes",
      () =>
        prisma.oAuthAuthorizationCode.deleteMany({
          where: { usedAt: null, expiresAt: { lt: now } },
        }),
    );

    const { count: refreshTokenCount } = await captureAsyncFunc(
      "delete expired OAuth refresh tokens",
      () =>
        prisma.oAuthRefreshToken.deleteMany({
          where: { expiresAt: { lt: now } },
        }),
    );

    // A grant without a refresh token can be in the redemption of its code.
    // The code expires 10 minutes after the creation of the grant, thus an
    // older grant cannot get a refresh token anymore.
    const grantCutoff = new Date(
      now.getTime() - AUTHORIZATION_CODE_LIFETIME_IN_MILLISECONDS,
    );
    const { count: grantCount } = await captureAsyncFunc(
      "delete OAuth grants without a token",
      () =>
        prisma.oAuthGrant.deleteMany({
          where: {
            createdAt: { lt: grantCutoff },
            refreshTokens: { none: {} },
            authorizationCodes: { none: { expiresAt: { gte: now } } },
          },
        }),
    );

    const clientMetadataCutoff = new Date(
      now.getTime() - CLIENT_METADATA_RETENTION_IN_MILLISECONDS,
    );
    const { count: clientMetadataCount } = await captureAsyncFunc(
      "delete expired OAuth client metadata documents",
      () =>
        prisma.oAuthClientMetadata.deleteMany({
          where: { expiresAt: { lt: clientMetadataCutoff } },
        }),
    );

    const counts = {
      authorizationCodeCount,
      refreshTokenCount,
      grantCount,
      clientMetadataCount,
    };
    if (Object.values(counts).every((count) => count <= 0)) return;

    log.info("Purged expired OAuth records", counts);

    await createAuditEvents([
      { type: AuditEventType.OAUTH_RECORDS_PURGED, data: counts },
    ]);
  });
};
