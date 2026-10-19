"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  restoreWikiPageInputSchema,
  restoreWikiPage as restoreWikiPageUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

/** Takes the page out of the trash (see the use case) */
export const restoreWikiPage = createAuthenticatedAction(
  "restoreWikiPage",
  restoreWikiPageInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await restoreWikiPageUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: WIKI_ERROR_TEXTS,
      });
    }

    refresh();

    return { success: "Erfolgreich wiederhergestellt." };
  },
  {
    parseFormData: (formData) => ({ page_id: formData.get("id") }),
  },
);
