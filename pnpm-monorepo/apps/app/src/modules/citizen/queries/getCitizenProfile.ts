import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  getCitizenProfile as getCitizenProfileUseCase,
  NotFoundError,
} from "@sam-monorepo/application";
import type { Citizen } from "@sam-monorepo/database/client";
import { cache } from "react";

export type { CitizenProfile } from "@sam-monorepo/application";

/**
 * The profile of the dashboard tile (see `getCitizenProfile` of the
 * application package), or null when the citizen does not exist. The
 * citizen popover reads it through tRPC.
 */
export const getCitizenProfile = cache(
  withTrace("getCitizenProfile", async (id: Citizen["id"]) => {
    try {
      return await getCitizenProfileUseCase(
        getApplicationContext(),
        await getRequestActor(),
        { citizen_id: id },
      );
    } catch (error) {
      if (error instanceof NotFoundError) return null;

      return throwApplicationErrorForPage(error);
    }
  }),
);
