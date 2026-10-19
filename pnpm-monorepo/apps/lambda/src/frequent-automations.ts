import { env } from "./frequent-automations/setup"; // must be first

import { notifyEventsStartingSoon } from "@sam-monorepo/application";
import type { ScheduledHandler } from "aws-lambda";
import { createApplicationContext } from "./common/createApplicationContext";
import { createJobFactory } from "./common/createJob";
import { runJobsInIsolation } from "./common/runJobsInIsolation";
import { birthdayGreetings } from "./frequent-automations/birthdayGreetings";
import { newYearGreetings } from "./frequent-automations/newYearGreetings";
import { wikiCitizenMentioned } from "./frequent-automations/wikiCitizenMentioned";

const context = createApplicationContext({
  source: "frequent-automations",
  baseUrl: env.BASE_URL,
  publicUploadBaseUrl: env.PUBLIC_UPLOAD_BASE_URL,
});

const createJob = createJobFactory(context);

export const handler: ScheduledHandler = async () =>
  runJobsInIsolation({
    eventStartingSoon: createJob(notifyEventsStartingSoon),
    wikiCitizenMentioned,
    birthdayGreetings,
    newYearGreetings,
  });
