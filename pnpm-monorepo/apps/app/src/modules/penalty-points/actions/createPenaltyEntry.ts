"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  createPenaltyEntryInputSchema,
  createPenaltyEntry as createPenaltyEntryUseCase,
  PenaltyEntryErrorMessage,
  type CreatePenaltyEntryOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";

export const createPenaltyEntry = createAuthenticatedAction(
  "createPenaltyEntry",
  createPenaltyEntryInputSchema,
  async (formData, authentication, data, t) => {
    let result: CreatePenaltyEntryOutput;
    try {
      result = await createPenaltyEntryUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: {
          [PenaltyEntryErrorMessage.CitizenDeleted]:
            "Der Citizen ist gelöscht.",
        },
      });
    }

    refresh();

    return {
      success: "Erfolgreich gespeichert.",
      ...(result.notifications_sent
        ? {}
        : { warning: t("Common.notificationsFailed") }),
    };
  },
  {
    parseFormData: (formData) => ({
      citizen_id: formData.get("citizenId"),
      points: Number(formData.get("points")),
      reason: formData.has("reason") ? formData.get("reason") : undefined,
      // The wall time of the form, in the time zone of the organization
      expires_at: formData.get("expiresAt") || undefined,
    }),
  },
);
