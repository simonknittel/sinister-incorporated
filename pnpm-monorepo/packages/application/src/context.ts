import type { Tracer } from "@opentelemetry/api";
import type { PrismaClientType } from "@sam-monorepo/database";
import type {
  AuditEventInput,
  GuildScheduledEventChange,
  GuildScheduledEventContent,
  GuildScheduledEventTarget,
  PermissionSet,
} from "@sam-monorepo/domain";
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

/** One editor connection to one wiki page */
export interface WikiCollabSession {
  /**
   * The user: the collab server writes its audit events for this user (the
   * subject of the token)
   */
  readonly userId: string;
  readonly pageId: string;
  /** The citizen that the collab server records as the editor */
  readonly entityId: string | null;
  /** False gives a read-only connection */
  readonly canEdit: boolean;
}

/** The key that signs the access tokens. Its public key is in the JWKS. */
export interface SigningKey {
  readonly privateKey: KeyObject;
  readonly publicJwk: JWK;
  /** The `kid` of the tokens and of the JWKS */
  readonly keyId: string;
  readonly algorithm: "ES256";
}

export enum DiscordOutcome {
  Success = "SUCCESS",
  /** Only for "Unknown Guild Scheduled Event" (the error code 10070) */
  NotFound = "NOT_FOUND",
  Failed = "FAILED",
}

export type DiscordResult<Data> =
  | { readonly outcome: DiscordOutcome.Success; readonly data: Data }
  | { readonly outcome: DiscordOutcome.NotFound }
  | { readonly outcome: DiscordOutcome.Failed };

/** A guild scheduled event as the sync reads it. Absent values are null. */
export interface DiscordScheduledEvent {
  readonly id: string;
  readonly guildId: string;
  readonly name: string;
  readonly description: string | null;
  readonly image: string | null;
  readonly startTime: Date;
  readonly endTime: Date | null;
  readonly creatorId: string | null;
  readonly location: string | null;
}

/** A channel of the guild. `type` is the channel type of Discord. */
export interface DiscordGuildChannel {
  readonly id: string;
  readonly name: string;
  readonly type: number;
  readonly position: number | null;
}

/** The bot of the guild. Never throws: every failure is a DiscordResult. */
export interface DiscordGateway {
  readonly listScheduledEvents: () => Promise<
    DiscordResult<DiscordScheduledEvent[]>
  >;
  /**
   * All pages, or Failed. Never a partial list: the sync cancels each user
   * that is not in it.
   */
  readonly listScheduledEventUserIds: (
    scheduledEventId: string,
  ) => Promise<DiscordResult<string[]>>;
  readonly listChannels: () => Promise<DiscordResult<DiscordGuildChannel[]>>;
  readonly createScheduledEvent: (
    content: GuildScheduledEventContent,
    target: GuildScheduledEventTarget,
  ) => Promise<DiscordResult<{ readonly id: string }>>;
  readonly modifyScheduledEvent: (
    scheduledEventId: string,
    change: GuildScheduledEventChange,
  ) => Promise<DiscordResult<null>>;
  readonly deleteScheduledEvent: (
    scheduledEventId: string,
  ) => Promise<DiscordResult<null>>;
}

/** The object storage of the uploads. Throws on a storage error. */
export interface FileStorage {
  /** The bytes, or null when the object is empty or larger than maximumBytes */
  readonly readObject: (
    key: string,
    options: { readonly maximumBytes: number },
  ) => Promise<Uint8Array | null>;
  readonly copyObject: (copy: {
    readonly sourceKey: string;
    readonly targetKey: string;
    readonly contentType: string;
  }) => Promise<void>;
}

/**
 * The services that the use cases get from the app that runs them. Each app
 * builds one context in its composition root.
 */
export interface ApplicationContext {
  readonly prisma: PrismaClientType;
  /**
   * The implementation never throws: it logs a failed write, because the
   * mutation that the events describe has happened.
   */
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
   * The collab server of the wiki editor. Null when the collab server is not
   * configured: then the wiki content is read-only and the app does not
   * offer the editor.
   */
  readonly collab: {
    /**
     * Replaces the content of a wiki page through the collab server, thus
     * the open editors get the new content
     */
    readonly replaceContent: (
      replacement: WikiPageContentReplacement,
    ) => Promise<void>;
    /**
     * A short-lived token for one editor connection, signed with the secret
     * that the host shares with the collab server
     */
    readonly createSessionToken: (
      session: WikiCollabSession,
    ) => Promise<string>;
  } | null;
  /**
   * Null when the host has no bot token. Then a use case behaves as if
   * Discord cannot be reached.
   */
  readonly discord: DiscordGateway | null;
  /**
   * Null when the host has no access to the bucket of the uploads. Then a
   * use case that must copy a file throws a `ConflictError`.
   */
  readonly storage: FileStorage | null;
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

interface ApplicationUrlsOptions {
  /** The base URL of the app */
  readonly baseUrl: string | URL;
  /** The public base URL of the uploads bucket */
  readonly publicUploadBaseUrl: string;
}

/** Each host derives the URLs of its context with this function */
export const createApplicationUrls = ({
  baseUrl: baseUrlValue,
  publicUploadBaseUrl,
}: ApplicationUrlsOptions): ApplicationContext["urls"] => {
  const baseUrl = new URL(baseUrlValue);

  return {
    baseUrl,
    issuer: baseUrl.href.replace(/\/$/, ""),
    mcpResourceUrl: new URL("/api/mcp", baseUrl),
    publicUploadBaseUrl: publicUploadBaseUrl.replace(/\/+$/, ""),
  };
};
