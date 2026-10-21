"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import {
  markChangelogEntriesSeenInputSchema,
  markChangelogEntriesSeen as markChangelogEntriesSeenUseCase,
} from "@sam-monorepo/application";
import { CHANGELOG_ERROR_TEXTS } from "../utils/changelogErrorTexts";

/**
 * Marks a batch of tracked changelog entries as seen by the citizen. Called
 * by the read-on-view tracking of the changelog page, hence the batch input.
 */
export const markChangelogEntriesSeen = createUseCaseAction({
  name: "markChangelogEntriesSeen",
  schema: markChangelogEntriesSeenInputSchema,
  useCase: markChangelogEntriesSeenUseCase,
  parseFormData: (formData) => ({
    keys: formData.getAll("key"),
  }),
  texts: CHANGELOG_ERROR_TEXTS,
  refresh: ActionRefresh.Never,
  success: () => "Als gelesen markiert",
});
