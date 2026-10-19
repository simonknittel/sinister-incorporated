import type { ApplicationContext } from "@sam-monorepo/application";
import { log } from "./logger";
import { captureAsyncFunc } from "./xray";

/**
 * Gives the function that runs an automation of the application package as a
 * job. `runJobsInIsolation()` gives the key of the job as its name in the logs
 * and in X-Ray.
 */
export const createJobFactory =
  (context: ApplicationContext) =>
  (automation: (context: ApplicationContext) => Promise<object>) =>
  (name: string) =>
    captureAsyncFunc(name, async () => {
      const output = await automation(context);
      log.info("Job finished", { job: name, ...output });
    });
