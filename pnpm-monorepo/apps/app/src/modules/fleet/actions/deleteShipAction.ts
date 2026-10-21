"use server";

import { createUseCaseAction } from "@/modules/application";
import { deleteShip, deleteShipInputSchema } from "@sam-monorepo/application";

export const deleteShipAction = createUseCaseAction({
  name: "deleteShip",
  schema: deleteShipInputSchema,
  useCase: deleteShip,
  parseFormData: (formData) => ({ ship_id: formData.get("id") }),
  success: (t) => t("Common.successfullyDeleted"),
});
