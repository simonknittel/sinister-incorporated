import { requireAuthentication } from "@/modules/auth/server";
import { cache } from "react";
import { toActor } from "./toActor";

/**
 * The actor of the current request, one time for each render. A server
 * action builds the actor with `toActor()` from the session that
 * `createAuthenticatedAction` gives it.
 */
export const getRequestActor = cache(async () =>
  toActor((await requireAuthentication()).session),
);
