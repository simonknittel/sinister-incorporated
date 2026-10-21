"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  createOrganizationInputSchema,
  createOrganization as createOrganizationUseCase,
  type CreateOrganizationOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getOrganizationErrorTexts } from "../utils/organizationErrorTexts";
import { scrapeOrganizationLogo } from "../utils/scrapeOrganizationLogo";

export const createOrganization = createAuthenticatedAction(
  "createOrganization",
  createOrganizationInputSchema,
  async (formData, authentication, data, t) => {
    let result: CreateOrganizationOutput;
    try {
      result = await createOrganizationUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
        { findLogo: scrapeOrganizationLogo },
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: getOrganizationErrorTexts(t),
      });
    }

    refresh();

    redirect(`/app/spynet/organization/${result.id}`);
  },
  {
    parseFormData: (formData) => ({
      spectrum_id: formData.get("spectrumId"),
      name: formData.get("name"),
    }),
  },
);
