import {
  getApplicationContext,
  throwApplicationErrorForPage,
  toActor,
} from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { listMyShips } from "@sam-monorepo/application";
import { cache } from "react";
import {
  toOwnerShipsInput,
  toShipsPage,
  type OwnerFleetOptions,
} from "../utils/fleetListMapping";

export const getMyFleet = cache(
  withTrace("getMyFleet", async (options: OwnerFleetOptions = {}) => {
    const { session } = await requireAuthentication();

    try {
      return toShipsPage(
        await listMyShips(
          getApplicationContext(),
          await toActor(session),
          toOwnerShipsInput(options),
        ),
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
