import { env } from "./midnight-automations/setup"; // must be first

import type { ApplicationContext } from "@sam-monorepo/application";
import {
  autoAssignInactiveRoles,
  countCitizensPerRole,
  countUniqueLogins,
  disburseRoleSalaries,
  endDueCollectionPhases,
  endDuePayoutPhases,
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
import { purgeOrphanedWikiTags } from "./midnight-automations/purgeOrphanedWikiTags";
import { purgeTrashedWikiPages } from "./midnight-automations/purgeTrashedWikiPages";

const context = createApplicationContext({
  source: "midnight-automations",
  baseUrl: env.BASE_URL,
  publicUploadBaseUrl: env.PUBLIC_UPLOAD_BASE_URL,
});

/**
 * Runs an automation of the application package as a job.
 * `runJobsInIsolation()` gives the key of the job as its name in the logs and
 * in X-Ray.
 */
const createJob =
  (automation: (context: ApplicationContext) => Promise<object>) =>
  (name: string) =>
    captureAsyncFunc(name, async () => {
      const output = await automation(context);
      log.info("Job finished", { job: name, ...output });
    });

export const handler: ScheduledHandler = async () =>
  runJobsInIsolation({
    endCollectionPhases: createJob(endDueCollectionPhases),
    endPayoutPhases: createJob(endDuePayoutPhases),
    removeExpiredRoles: createJob(removeExpiredRoleAssignments),
    autoAssignInactiveRoles: createJob(autoAssignInactiveRoles),
    countCitizensPerRole: createJob(countCitizensPerRole),
    disburseRoleSalaries: createJob(disburseRoleSalaries),
    countShips,
    countUniqueLogins: createJob(countUniqueLogins),
    purgeTrashedWikiPages,
    purgeOrphanedWikiTags,
    archiveIrrelevantOnSiteNotifications,
    deleteUnusedUploads,
    purgeExpiredAuthenticationRecords: createJob(
      purgeExpiredAuthenticationRecords,
    ),
    purgeExpiredOAuthRecords: createJob(purgeExpiredOAuthRecords),
  });
