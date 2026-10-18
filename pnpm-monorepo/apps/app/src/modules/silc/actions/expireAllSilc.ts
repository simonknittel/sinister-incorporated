"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { expireAllSilc as expireAllSilcUseCase } from "@sam-monorepo/application";
import { refresh } from "next/cache";
import * as z from "zod";

const schema = z.object({});

export const expireAllSilc = createAuthenticatedAction(
  "expireAllSilc",
  schema,
  async (formData, authentication, _data, t) => {
    try {
      await expireAllSilcUseCase(
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
