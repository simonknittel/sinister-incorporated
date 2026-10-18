import { getApplicationContext } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { listDevelopmentLoginUsers } from "@sam-monorepo/application";

export const getDevelopmentLoginUsers = withTrace(
  "getDevelopmentLoginUsers",
  async () => listDevelopmentLoginUsers(getApplicationContext()),
);
