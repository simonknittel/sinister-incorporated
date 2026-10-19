import "server-only";

import { prisma } from "@/db";
import { env } from "@/env";
import { listChangelogEntriesAsMarkdown } from "@/modules/changelog/utils/listChangelogEntriesAsMarkdown";
import { listTrackedChangelogEntries } from "@/modules/changelog/utils/listTrackedChangelogEntries";
import { createS3Client } from "@/modules/common/utils/createS3Client";
import { getPublicUploadBaseUrl } from "@/modules/common/utils/getPublicUploadUrl";
import { EMBED_TOKEN_ALGORITHM } from "@/modules/embed-authentication/utils/constants";
import { getEmbedSigningKey } from "@/modules/embed-authentication/utils/getEmbedSigningKey";
import { emitEvents } from "@/modules/eventbridge/utils";
import { log } from "@/modules/logging";
import { getTracer } from "@/modules/tracing/utils/getTracer";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  createApplicationUrls,
  type ApplicationContext,
} from "@sam-monorepo/application";
import {
  createCollabClient,
  createDiscordGateway,
  createEventBridgeEmailRequester,
  createPrismaAuditWriter,
  createS3Storage,
} from "@sam-monorepo/infrastructure";
import { triggerNotifications } from "./notificationTrigger";
import { sharpImageReader } from "./sharpImageReader";

/** The S3 client needs one of the two. Without them, the app has no bucket. */
const hasS3Endpoint = () =>
  env.S3_ENDPOINT !== undefined || Boolean(env.S3_ACCOUNT_ID);

const createApplicationContext = (): ApplicationContext => ({
  prisma,
  audit: createPrismaAuditWriter({ prisma, log }),
  notifications: { trigger: triggerNotifications },
  email: {
    request: withTrace(
      "requestEmail",
      createEventBridgeEmailRequester({ emitEvents, source: "App" }).request,
    ),
  },
  log,
  tracer: getTracer(),
  now: () => new Date(),
  changelog: {
    list: listChangelogEntriesAsMarkdown,
    listTrackedEntries: listTrackedChangelogEntries,
  },
  // The condition of `getWikiCollabUrl()`
  collab:
    env.COLLAB_URL && env.COLLAB_JWT_SECRET
      ? createCollabClient({
          url: env.COLLAB_URL,
          jwtSecret: env.COLLAB_JWT_SECRET,
          // A replace runs in an interactive request, thus a hanging collab
          // server must not hold the request open for long
          replaceTimeoutMilliseconds: 15_000,
        })
      : null,
  discord: createDiscordGateway({
    apiBaseUrl: env.DISCORD_API_BASE_URL,
    botToken: env.DISCORD_TOKEN,
    guildId: env.DISCORD_GUILD_ID,
    userAgent: `DiscordBot (${env.NEXT_PUBLIC_BASE_URL}, ${env.COMMIT_SHA ?? "0.0.0"})`,
    // A publish runs in an interactive request, thus a hanging Discord must
    // not hold the request open for long
    requestTimeoutMilliseconds: 10_000,
    // One short wait is enough for the low volume of a publish. A longer wait
    // is a failure, and the request does not block further.
    rateLimitRetry: { maximumRetryCount: 1, maximumWaitSeconds: 5 },
    log,
    tracer: getTracer(),
  }),
  storage: hasS3Endpoint()
    ? createS3Storage({
        client: createS3Client(),
        bucketName: env.S3_BUCKET_NAME,
      })
    : null,
  images: sharpImageReader,
  urls: createApplicationUrls({
    baseUrl: env.NEXT_PUBLIC_BASE_URL,
    publicUploadBaseUrl: getPublicUploadBaseUrl(),
  }),
  // The embed tokens and the access tokens use the same key
  signingKey: async () => {
    const signingKey = await getEmbedSigningKey();
    if (!signingKey) return null;

    return { ...signingKey, algorithm: EMBED_TOKEN_ALGORITHM };
  },
  allowInsecureLoopbackClientIds:
    env.OAUTH_ALLOW_INSECURE_LOOPBACK_CLIENT_IDS === "1",
});

/**
 * The environment does not change while the process runs, thus one context
 * serves all requests. The key of `signingKey` loads on its first call.
 */
let context: ApplicationContext | undefined;

/**
 * The only place in the app that knows how the application context is
 * built. Server actions, pages and route handlers get the context from here.
 */
export const getApplicationContext = () =>
  (context ??= createApplicationContext());
