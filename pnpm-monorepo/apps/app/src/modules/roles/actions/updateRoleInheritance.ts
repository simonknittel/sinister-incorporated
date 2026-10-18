"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateRoleInheritanceInputSchema,
  updateRoleInheritance as updateRoleInheritanceUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { getRoleErrorTexts } from "../utils/roleErrorTexts";

export const updateRoleInheritance = createAuthenticatedAction(
  "updateRoleInheritance",
  updateRoleInheritanceInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateRoleInheritanceUseCase(
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
      inherited_role_ids: formData.getAll("roles"),
    }),
  },
);
