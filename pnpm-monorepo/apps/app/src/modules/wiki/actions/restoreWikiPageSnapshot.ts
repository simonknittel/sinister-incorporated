"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  restoreWikiPageSnapshotInputSchema,
  restoreWikiPageSnapshot as restoreWikiPageSnapshotUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

/**
 * Makes a snapshot the current content of its page. A failed replace keeps
 * the safety snapshot, thus the refresh of the error shows it in the list.
 */
export const restoreWikiPageSnapshot = createAuthenticatedAction(
  "restoreWikiPageSnapshot",
  restoreWikiPageSnapshotInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await restoreWikiPageSnapshotUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
        { safetySnapshotName: "Automatische Sicherung vor Wiederherstellung" },
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: WIKI_ERROR_TEXTS,
      });
    }

    refresh();

    return { success: "Snapshot wiederhergestellt." };
  },
  {
    parseFormData: (formData) => ({
      snapshot_id: formData.get("snapshotId"),
    }),
  },
);
