import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { getOwnProfileSettings as getOwnProfileSettingsUseCase } from "@sam-monorepo/application";
import { cache } from "react";

/** The values of the profile form of the own citizen */
export const getOwnProfileSettings = cache(
  withTrace("getOwnProfileSettings", async () => {
    try {
      return await getOwnProfileSettingsUseCase(
        getApplicationContext(),
        await getRequestActor(),
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
