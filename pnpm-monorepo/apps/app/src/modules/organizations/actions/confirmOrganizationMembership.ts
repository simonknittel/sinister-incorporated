"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  confirmOrganizationMembershipInputSchema,
  confirmOrganizationMembership as confirmOrganizationMembershipUseCase,
} from "@sam-monorepo/application";
import { getOrganizationErrorTexts } from "../utils/organizationErrorTexts";

export const confirmOrganizationMembership = createUseCaseAction({
  name: "confirmOrganizationMembership",
  schema: confirmOrganizationMembershipInputSchema,
  useCase: confirmOrganizationMembershipUseCase,
  parseFormData: (formData) => ({
    history_entry_id: formData.get("id"),
    organization_id: formData.get("organizationId"),
    citizen_id: formData.get("citizenId"),
    confirmed: formData.get("confirmed"),
  }),
  texts: getOrganizationErrorTexts,
  success: (t) => t("Common.successfullySaved"),
});
