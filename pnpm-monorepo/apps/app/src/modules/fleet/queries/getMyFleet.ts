import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  listMyShips,
  UnknownCursorBehavior,
} from "@sam-monorepo/application";
import { cache } from "react";
import {
  toOwnerShipsInput,
  toShipsPage,
  type OwnerFleetOptions,
} from "../utils/fleetListMapping";

export const getMyFleet = cache(
  withTrace("getMyFleet", async (options: OwnerFleetOptions = {}) => {
    try {
      return toShipsPage(
        await listMyShips(
          getApplicationContext(),
          await getRequestActor(),
          toOwnerShipsInput(options),
          {
            direction: options.direction,
            unknownCursor: UnknownCursorBehavior.FirstPage,
          },
        ),
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
