import {
  getApplicationContext,
  throwApplicationErrorForPage,
  toActor,
} from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { listCitizenShips } from "@sam-monorepo/application";
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
      const { session } = await requireAuthentication();

      try {
        return toShipsPage(
          await listCitizenShips(
            getApplicationContext(),
            await toActor(session),
            { citizen_id: citizenId, ...toOwnerShipsInput(options) },
          ),
        );
      } catch (error) {
        return throwApplicationErrorForPage(error);
      }
    },
  ),
);
