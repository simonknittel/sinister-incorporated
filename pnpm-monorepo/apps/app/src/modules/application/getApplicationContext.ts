import "server-only";

import { prisma } from "@/db";
import { env } from "@/env";
import { createAuditEvents } from "@/modules/audit/utils/createAuditEvent";
import { listChangelogEntriesAsMarkdown } from "@/modules/changelog/utils/listChangelogEntriesAsMarkdown";
import { getPublicUploadBaseUrl } from "@/modules/common/utils/getPublicUploadUrl";
import { EMBED_TOKEN_ALGORITHM } from "@/modules/embed-authentication/utils/constants";
import { getEmbedSigningKey } from "@/modules/embed-authentication/utils/getEmbedSigningKey";
import { log } from "@/modules/logging";
import { triggerNotifications } from "@/modules/notifications/utils/triggerNotification";
import { getTracer } from "@/modules/tracing/utils/getTracer";
import { getWikiCollabUrl } from "@/modules/wiki/utils/getWikiCollabUrl";
import { replaceWikiPageContent } from "@/modules/wiki/utils/replaceWikiPageContent";
import type { ApplicationContext } from "@sam-monorepo/application";

const createApplicationContext = (): ApplicationContext => {
  const baseUrl = new URL(env.NEXT_PUBLIC_BASE_URL);

  return {
    prisma,
    audit: {
      create: async (events) => {
        await createAuditEvents(events);
      },
    },
    notifications: { trigger: triggerNotifications },
    log,
    tracer: getTracer(),
    now: () => new Date(),
    changelog: { list: listChangelogEntriesAsMarkdown },
    collab: getWikiCollabUrl()
      ? { replaceContent: replaceWikiPageContent }
      : null,
    urls: {
      baseUrl,
      issuer: baseUrl.href.replace(/\/$/, ""),
      mcpResourceUrl: new URL("/api/mcp", baseUrl),
      publicUploadBaseUrl: getPublicUploadBaseUrl(),
    },
    // The embed tokens and the access tokens use the same key
    signingKey: async () => {
      const signingKey = await getEmbedSigningKey();
      if (!signingKey) return null;

      return { ...signingKey, algorithm: EMBED_TOKEN_ALGORITHM };
    },
    allowInsecureLoopbackClientIds:
      env.OAUTH_ALLOW_INSECURE_LOOPBACK_CLIENT_IDS === "1",
  };
};

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
