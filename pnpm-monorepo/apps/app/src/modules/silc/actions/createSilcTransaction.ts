"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  createSilcTransactionInputSchema,
  createSilcTransaction as createSilcTransactionUseCase,
  type CreateSilcTransactionOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { SILC_ERROR_TEXTS } from "../utils/silcErrorTexts";

export const createSilcTransaction = createAuthenticatedAction(
  "createSilcTransaction",
  createSilcTransactionInputSchema,
  async (formData, authentication, data, t) => {
    let result: CreateSilcTransactionOutput;
    try {
      result = await createSilcTransactionUseCase(
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

    return {
      success: "Erfolgreich gespeichert.",
      ...(result.notifications_sent
        ? {}
        : { warning: t("Common.notificationsFailed") }),
    };
  },
  {
    parseFormData: (formData) => ({
      receiver_ids: formData.getAll("receiverId[]"),
      value: Number(formData.get("value")),
      description: formData.has("description")
        ? formData.get("description")
        : undefined,
    }),
  },
);
