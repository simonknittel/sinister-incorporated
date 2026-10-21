"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  deleteOrganizationMembershipInputSchema,
  deleteOrganizationMembership as deleteOrganizationMembershipUseCase,
} from "@sam-monorepo/application";

export const deleteOrganizationMembership = createUseCaseAction({
  name: "deleteOrganizationMembership",
  schema: deleteOrganizationMembershipInputSchema,
  useCase: deleteOrganizationMembershipUseCase,
  parseFormData: (formData) => ({
    organization_id: formData.get("organizationId"),
    citizen_id: formData.get("citizenId"),
  }),
  success: () => "Erfolgreich entfernt",
});
