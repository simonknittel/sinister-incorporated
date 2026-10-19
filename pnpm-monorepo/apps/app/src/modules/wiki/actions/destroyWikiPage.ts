"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  destroyWikiPageInputSchema,
  destroyWikiPage as destroyWikiPageUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

/** Deletes a page in the trash permanently (see the use case) */
export const destroyWikiPage = createAuthenticatedAction(
  "destroyWikiPage",
  destroyWikiPageInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await destroyWikiPageUseCase(
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

    return { success: "Endgültig gelöscht." };
  },
  {
    parseFormData: (formData) => ({ page_id: formData.get("id") }),
  },
);
