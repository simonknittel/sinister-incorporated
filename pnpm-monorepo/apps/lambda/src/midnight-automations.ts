import { env } from "./midnight-automations/setup"; // must be first

import type { ApplicationContext } from "@sam-monorepo/application";
import {
  autoAssignInactiveRoles,
  countCitizensPerRole,
  countUniqueLogins,
  purgeExpiredAuthenticationRecords,
  purgeExpiredOAuthRecords,
  removeExpiredRoleAssignments,
} from "@sam-monorepo/application";
import type { ScheduledHandler } from "aws-lambda";
import { createApplicationContext } from "./common/createApplicationContext";
import { log } from "./common/logger";
import { runJobsInIsolation } from "./common/runJobsInIsolation";
import { captureAsyncFunc } from "./common/xray";
import { archiveIrrelevantOnSiteNotifications } from "./midnight-automations/archiveIrrelevantOnSiteNotifications";
import { countShips } from "./midnight-automations/countShips";
import { deleteUnusedUploads } from "./midnight-automations/deleteUnusedUploads";
import { disburseRoleSalaries } from "./midnight-automations/disburseRoleSalaries";
import { endCollectionPhases } from "./midnight-automations/endCollectionPhases";
import { endPayoutPhases } from "./midnight-automations/endPayoutPhases";
import { purgeOrphanedWikiTags } from "./midnight-automations/purgeOrphanedWikiTags";
import { purgeTrashedWikiPages } from "./midnight-automations/purgeTrashedWikiPages";

const context = createApplicationContext({
  source: "midnight-automations",
  baseUrl: env.BASE_URL,
  publicUploadBaseUrl: env.PUBLIC_UPLOAD_BASE_URL,
});

/**
 * Runs an automation of the application package as a job. The name is the
 * name of the job in the logs and in X-Ray.
 */
const createJob =
  (
    name: string,
    automation: (context: ApplicationContext) => Promise<object>,
  ) =>
  () =>
    captureAsyncFunc(name, async () => {
      const output = await automation(context);
      log.info("Job finished", { job: name, ...output });
    });

export const handler: ScheduledHandler = async () =>
  runJobsInIsolation({
    endCollectionPhases,
    endPayoutPhases,
    removeExpiredRoles: createJob(
      "removeExpiredRoles",
      removeExpiredRoleAssignments,
    ),
    autoAssignInactiveRoles: createJob(
      "autoAssignInactiveRoles",
      autoAssignInactiveRoles,
    ),
    countCitizensPerRole: createJob(
      "countCitizensPerRole",
      countCitizensPerRole,
    ),
    disburseRoleSalaries,
    countShips,
    countUniqueLogins: createJob("countUniqueLogins", countUniqueLogins),
    purgeTrashedWikiPages,
    purgeOrphanedWikiTags,
    archiveIrrelevantOnSiteNotifications,
    deleteUnusedUploads,
    purgeExpiredAuthenticationRecords: createJob(
      "purgeExpiredAuthenticationRecords",
      purgeExpiredAuthenticationRecords,
    ),
    purgeExpiredOAuthRecords: createJob(
      "purgeExpiredOAuthRecords",
      purgeExpiredOAuthRecords,
    ),
  });
