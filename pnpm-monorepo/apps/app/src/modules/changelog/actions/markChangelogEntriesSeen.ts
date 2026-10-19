"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  markChangelogEntriesSeenInputSchema,
  markChangelogEntriesSeen as markChangelogEntriesSeenUseCase,
} from "@sam-monorepo/application";
import { CHANGELOG_ERROR_TEXTS } from "../utils/changelogErrorTexts";

/**
 * Marks a batch of tracked changelog entries as seen by the citizen. Called
 * by the read-on-view tracking of the changelog page, hence the batch input.
 */
export const markChangelogEntriesSeen = createAuthenticatedAction(
  "markChangelogEntriesSeen",
  markChangelogEntriesSeenInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await markChangelogEntriesSeenUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: CHANGELOG_ERROR_TEXTS,
      });
    }

    return { success: "Als gelesen markiert" };
  },
  {
    parseFormData: (formData) => ({
      keys: formData.getAll("key"),
    }),
  },
);
