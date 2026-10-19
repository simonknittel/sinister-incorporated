"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  trackWikiPageVisitInputSchema,
  trackWikiPageVisit as trackWikiPageVisitUseCase,
} from "@sam-monorepo/application";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

/**
 * Triggered from the client after the page mounted (see
 * `<TrackWikiPageVisit>`), because hover-triggered prefetching renders pages
 * that the user never visits — while a navigation served from the prefetch
 * cache produces no server render at all.
 */
export const trackWikiPageVisit = createAuthenticatedAction(
  "trackWikiPageVisit",
  trackWikiPageVisitInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await trackWikiPageVisitUseCase(
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

    return { success: "Seitenbesuch gespeichert." };
  },
  {
    parseFormData: (formData) => ({ page_id: formData.get("pageId") }),
  },
);
