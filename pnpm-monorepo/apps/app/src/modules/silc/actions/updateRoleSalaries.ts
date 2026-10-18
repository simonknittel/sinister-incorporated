"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateRoleSalariesInputSchema,
  updateRoleSalaries as updateRoleSalariesUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { SILC_ERROR_TEXTS } from "../utils/silcErrorTexts";

export const updateRoleSalaries = createAuthenticatedAction(
  "updateRoleSalaries",
  updateRoleSalariesInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateRoleSalariesUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: SILC_ERROR_TEXTS,
      });
    }

    refresh();

    return { success: t("Common.successfullySaved") };
  },
  {
    /** A row without a selected role sends no role id: the lengths differ */
    parseFormData: (formData) => ({
      role_ids: formData.getAll("roleId[]"),
      values: formData.getAll("value[]").map(Number),
      days_of_month: formData.getAll("dayOfMonth[]").map(Number),
    }),
  },
);
