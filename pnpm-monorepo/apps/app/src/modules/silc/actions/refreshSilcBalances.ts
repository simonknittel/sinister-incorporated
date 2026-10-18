"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { refreshSilcBalances as refreshSilcBalancesUseCase } from "@sam-monorepo/application";
import { refresh } from "next/cache";
import * as z from "zod";

const schema = z.object({});

export const refreshSilcBalances = createAuthenticatedAction(
  "refreshSilcBalances",
  schema,
  async (formData, authentication, _data, t) => {
    try {
      await refreshSilcBalancesUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    refresh();

    return { success: "Erfolgreich gespeichert." };
  },
);
