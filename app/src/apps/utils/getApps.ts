import { authenticate } from "@/auth/server";
import { apps } from "./apps";

export const getApps = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const permissions = await Promise.all([
    authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "security",
      },
    ]),
    authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "economic",
      },
    ]),
    authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "management",
      },
    ]),
    authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "team",
      },
    ]),
    authentication.authorize("citizen", "read"),
    authentication.authorize("logAnalyzer", "read"),
    authentication.authorize("organization", "read"),
    authentication.authorize("orgFleet", "read"),
    authentication.authorize("penaltyEntry", "create"),
    authentication.authorize("role", "manage"),
    authentication.authorize("ship", "manage"),
    authentication.authorize("silcBalanceOfOtherCitizen", "read"),
    authentication.authorize("task", "read"),
    authentication.authorize("user", "read"),
  ]);

  return apps(permissions);
};
