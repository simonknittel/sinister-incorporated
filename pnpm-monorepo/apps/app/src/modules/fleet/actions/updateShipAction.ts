"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { renameShip, renameShipInputSchema } from "@sam-monorepo/application";
import { refresh } from "next/cache";

export const updateShipAction = createAuthenticatedAction(
  "updateShipAction",
  renameShipInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await renameShip(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    refresh();

    return { success: t("Common.successfullySaved") };
  },
  {
    parseFormData: (formData) => ({
      ship_id: formData.get("id"),
      name: formData.get("name"),
    }),
  },
);
