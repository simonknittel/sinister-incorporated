"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  createCitizenInputSchema,
  createCitizen as createCitizenUseCase,
  type CreateCitizenOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { CITIZEN_ERROR_TEXTS } from "../utils/citizenErrorTexts";

/**
 * Creates a citizen and opens its page. A known Spectrum ID opens its
 * citizen and creates no duplicate.
 *
 * In the browser, each redirect rejects the action with a redirect error
 * that Next.js handled already: the router opens the page, and the nearest
 * `RedirectBoundary` mounts its subtree again. This closes the create modal,
 * because its state is in that subtree. The success hook of the form does
 * not run.
 */
export const createCitizen = createAuthenticatedAction(
  "createCitizen",
  createCitizenInputSchema,
  async (formData, authentication, data, t) => {
    let result: CreateCitizenOutput;
    try {
      result = await createCitizenUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: CITIZEN_ERROR_TEXTS,
      });
    }

    if (result.created) refresh();

    redirect(`/app/spynet/citizen/${result.citizen_id}`);
  },
  {
    parseFormData: (formData) => ({ spectrum_id: formData.get("spectrumId") }),
  },
);
