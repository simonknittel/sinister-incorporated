"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateOwnProfile,
  updateOwnProfileInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { CITIZEN_ERROR_TEXTS } from "../utils/citizenErrorTexts";

/**
 * The selects of the form submit an empty string when the citizen clears the
 * value. A missing field stays missing, thus the schema refuses it.
 */
const toOptionalValue = <Value>(
  value: FormDataEntryValue | null,
  transform: (value: string) => Value,
) => {
  if (value === null) return undefined;
  if (value === "") return null;
  return typeof value === "string" ? transform(value) : value;
};

export const updateMyProfile = createAuthenticatedAction(
  "updateMyProfile",
  updateOwnProfileInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateOwnProfile(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: CITIZEN_ERROR_TEXTS,
      });
    }

    refresh();

    return {
      success: t("Common.successfullySaved"),
    };
  },
  {
    parseFormData: (formData) => ({
      timezone: toOptionalValue(formData.get("timezone"), String),
      birthday_day: toOptionalValue(formData.get("birthdayDay"), Number),
      birthday_month: toOptionalValue(formData.get("birthdayMonth"), Number),
    }),
  },
);
