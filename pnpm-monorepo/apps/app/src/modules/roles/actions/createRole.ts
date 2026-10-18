"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  createRoleInputSchema,
  createRole as createRoleUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { ROLE_ERROR_TEXTS } from "../utils/roleErrorTexts";

export const createRole = createAuthenticatedAction(
  "createRole",
  createRoleInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await createRoleUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: ROLE_ERROR_TEXTS,
      });
    }

    refresh();

    return { success: t("Common.successfullySaved") };
  },
);
