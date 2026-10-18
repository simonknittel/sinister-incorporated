import { trace } from "@opentelemetry/api";
import { prisma } from "@sam-monorepo/database";
import { UserRole } from "@sam-monorepo/database/browser";
import {
  transformPermissionStringToPermissionSet,
  type AuditEventInput,
} from "@sam-monorepo/domain";
import { createActor, type Actor, type ActorCitizen } from "../src/actor.js";
import {
  createApplicationUrls,
  type ApplicationContext,
  type Notification,
} from "../src/context.js";

/** A fixed clock, thus a result does not depend on the day of the test run */
export const TEST_NOW = new Date("2026-06-15T10:00:00.000Z");

const SILENT_LOGGER: ApplicationContext["log"] = {
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

type TestApplicationContextOptions = Partial<
  Omit<ApplicationContext, "now">
> & {
  /** The time that `context.now()` gives */
  readonly now?: Date;
};

/**
 * The context of the integration tests. It uses the database of the
 * testcontainer (`test/databaseUrl.ts` sets the URL before the test files
 * load). The audit writer and the notification trigger only record, thus a
 * test can examine `auditEvents` and `notifications`. An override replaces
 * the port of the same name.
 */
export const createTestApplicationContext = ({
  now = TEST_NOW,
  ...overrides
}: TestApplicationContextOptions = {}) => {
  const auditEvents: AuditEventInput[] = [];
  const notifications: Notification[] = [];

  const context: ApplicationContext = {
    prisma,
    audit: {
      create: async (events) => {
        auditEvents.push(...events);
      },
    },
    notifications: {
      trigger: async (requestedNotifications) => {
        notifications.push(...requestedNotifications);
      },
    },
    log: SILENT_LOGGER,
    tracer: trace.getTracer("test"),
    // A copy, thus a use case that changes the date does not change the clock
    now: () => new Date(now),
    changelog: null,
    collab: null,
    discord: null,
    storage: null,
    urls: createApplicationUrls({
      baseUrl: "https://sam.example.com",
      publicUploadBaseUrl: "https://uploads.example.com",
    }),
    signingKey: async () => null,
    allowInsecureLoopbackClientIds: false,
    ...overrides,
  };

  return { context, auditEvents, notifications };
};

interface TestActorOptions {
  readonly userId: string;
  /** The citizen must exist in the database when a use case writes its id */
  readonly citizen?: ActorCitizen | null;
  readonly permissionStrings?: readonly string[];
  /** Gives the actor the admin role with admin mode */
  readonly adminMode?: boolean;
}

/** An actor with a confirmed email address and the given permission strings */
export const createTestActor = ({
  userId,
  citizen = null,
  permissionStrings = [],
  adminMode = false,
}: TestActorOptions): Actor =>
  createActor({
    userId,
    userRole: adminMode ? UserRole.ADMIN : null,
    emailConfirmedAt: TEST_NOW,
    citizen,
    roleIds: new Set(),
    discordUserId: null,
    permissionSets: permissionStrings.map(
      transformPermissionStringToPermissionSet,
    ),
    adminMode,
  });
