"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  moveWikiPageInputSchema,
  moveWikiPage as moveWikiPageUseCase,
} from "@sam-monorepo/application";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const moveWikiPage = createUseCaseAction({
  name: "moveWikiPage",
  schema: moveWikiPageInputSchema,
  useCase: moveWikiPageUseCase,
  parseFormData: (formData) => {
    const newParentId = formData.get("newParentId");

    return {
      page_id: formData.get("id"),
      // An empty value moves the page to the top level
      parent_id: newParentId === "" ? null : (newParentId ?? undefined),
    };
  },
  texts: WIKI_ERROR_TEXTS,
  success: (t, output) => {
    /** The reset includes the moved page itself */
    const subpageCount = output.reset_page_count - 1;

    return subpageCount > 0
      ? `Erfolgreich verschoben. Die Seite und ${subpageCount} Unterseite(n) übernehmen jetzt die Berechtigungen des neuen Elternteils.`
      : "Erfolgreich verschoben. Die Seite übernimmt jetzt die Berechtigungen des neuen Elternteils.";
  },
});
