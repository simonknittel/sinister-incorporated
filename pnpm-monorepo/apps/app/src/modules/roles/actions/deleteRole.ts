"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  deleteRoleInputSchema,
  deleteRole as deleteRoleUseCase,
} from "@sam-monorepo/application";
import { getRoleErrorTexts } from "../utils/roleErrorTexts";

export const deleteRole = createUseCaseAction({
  name: "deleteRole",
  schema: deleteRoleInputSchema,
  useCase: deleteRoleUseCase,
  parseFormData: (formData) => ({ role_id: formData.get("id") }),
  texts: getRoleErrorTexts,
  redirect: () => "/app/iam/roles",
});
