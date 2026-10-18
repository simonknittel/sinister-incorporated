"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateRoleInputSchema,
  updateRole as updateRoleUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { getRoleErrorTexts } from "../utils/roleErrorTexts";

/** An empty number field removes the value */
const parseOptionalNumber = (value: FormDataEntryValue | null) =>
  value ? Number(value) : null;

export const updateRole = createAuthenticatedAction(
  "updateRole",
  updateRoleInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateRoleUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: getRoleErrorTexts(t),
      });
    }

    refresh();

    return { success: t("Common.successfullySaved") };
  },
  {
    parseFormData: (formData) => ({
      role_id: formData.get("id"),
      name: formData.get("name"),
      description: formData.get("description") || null,
      max_age_days: parseOptionalNumber(formData.get("maxAgeDays")),
      assign_after_inactive_days: parseOptionalNumber(
        formData.get("assignAfterInactiveDays"),
      ),
      max_level: parseOptionalNumber(formData.get("maxLevel")),
    }),
  },
);
