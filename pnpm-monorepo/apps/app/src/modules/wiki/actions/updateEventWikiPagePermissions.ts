"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateEventWikiPagePermissions as updateEventWikiPagePermissionsUseCase,
  updateEventWikiPagePermissionsInputSchema,
  type UpdateEventWikiPagePermissionsOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

/** See `updateEventWikiPagePermissions()` of the application */
export const updateEventWikiPagePermissions = createAuthenticatedAction(
  "updateEventWikiPagePermissions",
  updateEventWikiPagePermissionsInputSchema,
  async (formData, authentication, data, t) => {
    let result: UpdateEventWikiPagePermissionsOutput;
    try {
      result = await updateEventWikiPagePermissionsUseCase(
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
      success: t("Common.successfullySaved"),
      ...(result.notifications_sent
        ? {}
        : { warning: t("Common.notificationsFailed") }),
    };
  },
  {
    parseFormData: (formData) => ({
      page_id: formData.get("id"),
      read_scope: formData.get("readScope"),
      /** The select sends an empty value when no position is selected */
      read_scope_position_id: formData.get("readScopePositionId") || null,
      edit_scope: formData.get("editScope"),
      image_uploadability: formData.get("imageUploadability"),
      attachment_uploadability: formData.get("attachmentUploadability"),
    }),
  },
);
