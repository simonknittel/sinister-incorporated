"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  validateWikiIframeSrcInputSchema,
  validateWikiIframeSrc as validateWikiIframeSrcUseCase,
} from "@sam-monorepo/application";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const validateWikiIframeSrc = createAuthenticatedAction(
  "validateWikiIframeSrc",
  validateWikiIframeSrcInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await validateWikiIframeSrcUseCase(
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

    return { success: "Erlaubt." };
  },
);
