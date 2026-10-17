"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { createShip, createShipInputSchema } from "@sam-monorepo/application";
import { refresh } from "next/cache";

export const createShipAction = createAuthenticatedAction(
  "createShipAction",
  createShipInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await createShip(
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
      variant_id: formData.get("variantId"),
      name: formData.has("name") ? formData.get("name") : undefined,
    }),
  },
);
