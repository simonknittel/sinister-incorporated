"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateCycleParticipants,
  updateCycleParticipantsInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { getProfitDistributionErrorTexts } from "../utils/profitDistributionErrorTexts";

const CYCLE_ID_FIELD = "cycleId";

export const updateParticipantAttribute = createAuthenticatedAction(
  "updateParticipantAttribute",
  updateCycleParticipantsInputSchema,
  async (formData, authentication, data, t) => {
    let result;
    try {
      result = await updateCycleParticipants(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: getProfitDistributionErrorTexts(t),
      });
    }

    refresh();

    return {
      success: t("Common.successfullySaved"),
      ...(result.notifications_sent
        ? {}
        : { warning: t("Common.notificationsFailed") }),
    };
  },
  {
    /**
     * Each ticked checkbox sends a field with the name
     * `<attribute>_<cycle id>_<citizen id>` (see `CitizenTable`)
     */
    parseFormData: (formData) => ({
      cycle_id: formData.get(CYCLE_ID_FIELD),
      enabled_attributes: Array.from(formData.keys())
        .filter((key) => key !== CYCLE_ID_FIELD && !key.startsWith("$ACTION"))
        .map((key) => {
          const [attribute, , citizenId] = key.split("_");

          return { attribute, citizen_id: citizenId };
        }),
    }),
  },
);
