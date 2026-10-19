"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  createWikiCollabTokenInputSchema,
  createWikiCollabToken as createWikiCollabTokenUseCase,
  type CreateWikiCollabTokenOutput,
} from "@sam-monorepo/application";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

/**
 * A short-lived token for the connection to the collab server. The collab
 * provider calls it on each connection and reconnection.
 */
export const createWikiCollabToken = createAuthenticatedAction<
  typeof createWikiCollabTokenInputSchema,
  { token: string }
>(
  "createWikiCollabToken",
  createWikiCollabTokenInputSchema,
  async (formData, authentication, data, t) => {
    let result: CreateWikiCollabTokenOutput;
    try {
      result = await createWikiCollabTokenUseCase(
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

    return { token: result.token };
  },
  {
    parseFormData: (formData) => ({
      page_id: formData.get("id"),
    }),
  },
);
