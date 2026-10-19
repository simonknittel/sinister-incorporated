"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateWikiPageFavoriteInputSchema,
  updateWikiPageFavorite as updateWikiPageFavoriteUseCase,
  type UpdateWikiPageFavoriteOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const updateWikiPageFavorite = createAuthenticatedAction(
  "updateWikiPageFavorite",
  updateWikiPageFavoriteInputSchema,
  async (formData, authentication, data, t) => {
    let result: UpdateWikiPageFavoriteOutput;
    try {
      result = await updateWikiPageFavoriteUseCase(
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

    /** Also without a change: a different tab can have set the state before */
    refresh();

    return {
      success: result.is_favorite
        ? "Als Favorit gespeichert."
        : "Favorit entfernt.",
    };
  },
  {
    parseFormData: (formData) => ({
      page_id: formData.get("pageId"),
      /** Absent removes the page from the favorites */
      is_favorite: formData.get("isFavorite") === "1",
    }),
  },
);
