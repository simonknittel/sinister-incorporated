"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  createOrganizationMembershipInputSchema,
  createOrganizationMembership as createOrganizationMembershipUseCase,
} from "@sam-monorepo/application";
import { getOrganizationErrorTexts } from "../utils/organizationErrorTexts";

export const createOrganizationMembership = createUseCaseAction({
  name: "createOrganizationMembership",
  schema: createOrganizationMembershipInputSchema,
  useCase: createOrganizationMembershipUseCase,
  parseFormData: (formData) => ({
    organization_id: formData.get("organizationId"),
    citizen_id: formData.get("citizenId"),
    type: formData.get("type"),
    visibility: formData.has("visibility")
      ? formData.get("visibility")
      : undefined,
    confirmed: formData.has("confirmed")
      ? formData.get("confirmed")
      : undefined,
  }),
  texts: getOrganizationErrorTexts,
  success: (t) => t("Common.successfullySaved"),
});
