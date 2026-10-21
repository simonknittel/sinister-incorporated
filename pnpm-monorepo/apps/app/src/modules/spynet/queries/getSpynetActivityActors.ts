import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { findSpynetActivityActors } from "@sam-monorepo/application";
import { cache } from "react";

/**
 * Everyone who caused at least one entry the reader may see, for the actor
 * filter. Requires `spynetActivity;read`.
 */
export const getSpynetActivityActors = cache(async () => {
  try {
    return await findSpynetActivityActors(
      getApplicationContext(),
      await getRequestActor(),
    );
  } catch (error) {
    return throwApplicationErrorForPage(error);
  }
});
