"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  createRoleInputSchema,
  createRole as createRoleUseCase,
} from "@sam-monorepo/application";
import { getRoleErrorTexts } from "../utils/roleErrorTexts";

export const createRole = createUseCaseAction({
  name: "createRole",
  schema: createRoleInputSchema,
  useCase: createRoleUseCase,
  texts: getRoleErrorTexts,
  success: (t) => t("Common.successfullySaved"),
});
