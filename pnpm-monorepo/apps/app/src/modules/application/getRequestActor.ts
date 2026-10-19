import { authenticate, requireAuthentication } from "@/modules/auth/server";
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

/**
 * The actor of the current request, or null without a session. For the reads
 * of the shell (the layout of `/app` and the login page): they give an empty
 * answer without a session, also when the session expired.
 */
export const getOptionalRequestActor = cache(async () => {
  const authentication = await authenticate();
  return authentication ? toActor(authentication.session) : null;
});
