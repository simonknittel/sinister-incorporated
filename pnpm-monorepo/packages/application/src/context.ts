import type { Tracer } from "@opentelemetry/api";
import type { PrismaClientType } from "@sam-monorepo/database";
import type { AuditEventInput, PermissionSet } from "@sam-monorepo/domain";
import type { JWK } from "jose";
import type { KeyObject } from "node:crypto";

export interface Notification {
  readonly type: string;
  readonly payload: unknown;
}

export type LogArguments = Record<string, unknown>;

/** Never put tokens, secrets or personal data into a log record */
export interface Logger {
  readonly info: (message: string, args?: LogArguments) => void;
  readonly warn: (message: string, args?: LogArguments) => void;
  readonly error: (message: string, args?: LogArguments) => void;
}

/** One changelog entry with its body as Markdown */
export interface ChangelogEntrySource {
  readonly key: string;
  /** ISO date (`YYYY-MM-DD`) */
  readonly date: string;
  readonly title: string;
  readonly tags: string[];
  readonly isTracked: boolean;
  /** The permission that a reader must have, or null for all readers */
  readonly requiresAuth: {
    readonly resource: PermissionSet["resource"];
    readonly operation: PermissionSet["operation"];
  } | null;
  readonly markdown: string;
}

export interface WikiPageContentReplacement {
  readonly pageId: string;
  /** Tiptap JSON that agrees with the schema of the editor */
  readonly content: object;
  /** The citizen that the collab server records as the last editor */
  readonly updatedByEntityId: string | null;
}

/** The key that signs the access tokens. Its public key is in the JWKS. */
export interface SigningKey {
  readonly privateKey: KeyObject;
  readonly publicJwk: JWK;
  /** The `kid` of the tokens and of the JWKS */
  readonly keyId: string;
  readonly algorithm: "ES256";
}

/**
 * The services that the use cases get from the app that runs them. Each app
 * builds one context in its composition root.
 */
export interface ApplicationContext {
  readonly prisma: PrismaClientType;
  readonly audit: {
    readonly create: (events: AuditEventInput[]) => Promise<void>;
  };
  readonly notifications: {
    readonly trigger: (notifications: Notification[]) => Promise<void>;
  };
  readonly log: Logger;
  readonly tracer: Tracer;
  readonly now: () => Date;
  /**
   * Null when the host has no changelog entries. The entries are React code
   * of the Next.js app, thus the Lambda functions give null.
   */
  readonly changelog: {
    readonly list: () => Promise<ChangelogEntrySource[]>;
  } | null;
  /**
   * Replaces the content of a wiki page through the collab server, thus the
   * open editors get the new content. Null when the collab server is not
   * configured: then the wiki content is read-only.
   */
  readonly collab: {
    readonly replaceContent: (
      replacement: WikiPageContentReplacement,
    ) => Promise<void>;
  } | null;
  readonly urls: {
    readonly baseUrl: URL;
    /** The base URL without the trailing slash */
    readonly issuer: string;
    /** The canonical URL of the MCP endpoint, the audience of the tokens */
    readonly mcpResourceUrl: URL;
    readonly publicUploadBaseUrl: string;
  };
  /**
   * Gives null when no key is configured. The key loads on the first call,
   * thus an incorrect key stops only the use cases that sign or verify
   * tokens.
   */
  readonly signingKey: () => Promise<SigningKey | null>;
  /** Permits client ids with plain HTTP on a loopback host (tests only) */
  readonly allowInsecureLoopbackClientIds: boolean;
}
