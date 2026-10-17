import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  listCitizenShips,
  UnknownCursorBehavior,
} from "@sam-monorepo/application";
import type { Citizen } from "@sam-monorepo/database/client";
import { cache } from "react";
import {
  toOwnerShipsInput,
  toShipsPage,
  type OwnerFleetOptions,
} from "../utils/fleetListMapping";

export const getCitizenFleet = cache(
  withTrace(
    "getCitizenFleet",
    async (citizenId: Citizen["id"], options: OwnerFleetOptions = {}) => {
      try {
        return toShipsPage(
          await listCitizenShips(
            getApplicationContext(),
            await getRequestActor(),
            { citizen_id: citizenId, ...toOwnerShipsInput(options) },
            {
              direction: options.direction,
              unknownCursor: UnknownCursorBehavior.FirstPage,
            },
          ),
        );
      } catch (error) {
        return throwApplicationErrorForPage(error);
      }
    },
  ),
);
