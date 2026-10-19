"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  deleteUploadInputSchema,
  deleteUpload as deleteUploadUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";

export const deleteUpload = createAuthenticatedAction(
  "deleteUpload",
  deleteUploadInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await deleteUploadUseCase(
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
    parseFormData: (formData) => ({ upload_id: formData.get("id") }),
  },
);
