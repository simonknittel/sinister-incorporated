import { env } from "./midnight-automations/setup"; // must be first

import {
  autoAssignInactiveRoles,
  countCitizensPerRole,
  countUniqueLogins,
  disburseRoleSalaries,
  endDueCollectionPhases,
  endDuePayoutPhases,
  purgeExpiredAuthenticationRecords,
  purgeExpiredOAuthRecords,
  purgeOrphanedWikiTags,
  purgeTrashedWikiPages,
  removeExpiredRoleAssignments,
} from "@sam-monorepo/application";
import type { ScheduledHandler } from "aws-lambda";
import { createApplicationContext } from "./common/createApplicationContext";
import { createJobFactory } from "./common/createJob";
import { runJobsInIsolation } from "./common/runJobsInIsolation";
import { archiveIrrelevantOnSiteNotifications } from "./midnight-automations/archiveIrrelevantOnSiteNotifications";
import { countShips } from "./midnight-automations/countShips";
import { deleteUnusedUploads } from "./midnight-automations/deleteUnusedUploads";

const context = createApplicationContext({
  source: "midnight-automations",
  baseUrl: env.BASE_URL,
  publicUploadBaseUrl: env.PUBLIC_UPLOAD_BASE_URL,
});

const createJob = createJobFactory(context);

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
    purgeTrashedWikiPages: createJob(purgeTrashedWikiPages),
    purgeOrphanedWikiTags: createJob(purgeOrphanedWikiTags),
    archiveIrrelevantOnSiteNotifications,
    deleteUnusedUploads,
    purgeExpiredAuthenticationRecords: createJob(
      purgeExpiredAuthenticationRecords,
    ),
    purgeExpiredOAuthRecords: createJob(purgeExpiredOAuthRecords),
  });
