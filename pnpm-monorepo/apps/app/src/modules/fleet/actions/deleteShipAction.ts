"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { deleteShip, deleteShipInputSchema } from "@sam-monorepo/application";
import { refresh } from "next/cache";

export const deleteShipAction = createAuthenticatedAction(
  "deleteShip",
  deleteShipInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await deleteShip(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    refresh();

    return { success: t("Common.successfullyDeleted") };
  },
  {
    parseFormData: (formData) => ({ ship_id: formData.get("id") }),
  },
);
