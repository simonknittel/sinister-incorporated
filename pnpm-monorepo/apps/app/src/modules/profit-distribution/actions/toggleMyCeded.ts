"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  setOwnParticipationInputSchema,
  setOwnShareCeded,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import * as z from "zod";
import { getProfitDistributionErrorTexts } from "../utils/profitDistributionErrorTexts";

/** The button sends the new state as text */
const schema = setOwnParticipationInputSchema.extend({
  enabled: z.stringbool(),
});

export const toggleMyCeded = createAuthenticatedAction(
  "toggleMyCeded",
  schema,
  async (formData, authentication, data, t) => {
    try {
      await setOwnShareCeded(
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

    return { success: t("Common.successfullySaved") };
  },
  {
    parseFormData: (formData) => {
      // The last entry of each field, see `ToggleMyAcceptedButton`
      const { id, value } = Object.fromEntries(formData);

      return { cycle_id: id, enabled: value };
    },
  },
);
