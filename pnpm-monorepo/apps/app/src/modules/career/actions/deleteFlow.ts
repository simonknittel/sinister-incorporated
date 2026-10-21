"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  deleteFlowInputSchema,
  deleteFlow as deleteFlowUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { CAREER_ERROR_TEXTS } from "../utils/careerErrorTexts";

export const deleteFlow = createAuthenticatedAction(
  "deleteFlow",
  deleteFlowInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await deleteFlowUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: CAREER_ERROR_TEXTS,
      });
    }

    refresh();

    /** The detail page is gone with the flow; the list is where a restore starts */
    redirect("/app/career/settings");
  },
  {
    parseFormData: (formData) => ({ flow_id: formData.get("flowId") }),
  },
);
