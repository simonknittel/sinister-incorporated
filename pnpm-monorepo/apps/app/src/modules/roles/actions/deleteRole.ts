"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  deleteRoleInputSchema,
  deleteRole as deleteRoleUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getRoleErrorTexts } from "../utils/roleErrorTexts";

export const deleteRole = createAuthenticatedAction(
  "deleteRole",
  deleteRoleInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await deleteRoleUseCase(
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

    redirect("/app/iam/roles");
  },
  { parseFormData: (formData) => ({ role_id: formData.get("id") }) },
);
