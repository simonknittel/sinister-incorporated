"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  moveWikiPageInputSchema,
  moveWikiPage as moveWikiPageUseCase,
  type MoveWikiPageOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const moveWikiPage = createAuthenticatedAction(
  "moveWikiPage",
  moveWikiPageInputSchema,
  async (formData, authentication, data, t) => {
    let result: MoveWikiPageOutput;
    try {
      result = await moveWikiPageUseCase(
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

    /** The reset includes the moved page itself */
    const subpageCount = result.reset_page_count - 1;
    return {
      success:
        subpageCount > 0
          ? `Erfolgreich verschoben. Die Seite und ${subpageCount} Unterseite(n) übernehmen jetzt die Berechtigungen des neuen Elternteils.`
          : "Erfolgreich verschoben. Die Seite übernimmt jetzt die Berechtigungen des neuen Elternteils.",
    };
  },
  {
    parseFormData: (formData) => {
      const newParentId = formData.get("newParentId");

      return {
        page_id: formData.get("id"),
        // An empty value moves the page to the top level
        parent_id: newParentId === "" ? null : (newParentId ?? undefined),
      };
    },
  },
);
