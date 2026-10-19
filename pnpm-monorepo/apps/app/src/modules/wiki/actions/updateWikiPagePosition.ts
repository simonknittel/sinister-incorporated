"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateWikiPagePositionInputSchema,
  updateWikiPagePosition as updateWikiPagePositionUseCase,
  type UpdateWikiPagePositionOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

/** Drops the page at a new place in the sidebar tree (see the use case) */
export const updateWikiPagePosition = createAuthenticatedAction(
  "updateWikiPagePosition",
  updateWikiPagePositionInputSchema,
  async (formData, authentication, data, t) => {
    let result: UpdateWikiPagePositionOutput;
    try {
      result = await updateWikiPagePositionUseCase(
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

    return {
      success: result.moved_to_new_parent
        ? "Erfolgreich verschoben. Die Seite und ihre Unterseiten übernehmen jetzt die Berechtigungen des neuen Elternteils."
        : t("Common.successfullySaved"),
    };
  },
  {
    parseFormData: (formData) => ({
      page_id: formData.get("id"),
      reference_page_id: formData.get("referenceId"),
      position: formData.get("position"),
    }),
  },
);
