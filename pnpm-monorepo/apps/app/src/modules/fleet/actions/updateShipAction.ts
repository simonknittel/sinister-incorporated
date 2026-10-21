"use server";

import { createUseCaseAction } from "@/modules/application";
import { renameShip, renameShipInputSchema } from "@sam-monorepo/application";

export const updateShipAction = createUseCaseAction({
  name: "updateShipAction",
  schema: renameShipInputSchema,
  useCase: renameShip,
  parseFormData: (formData) => ({
    ship_id: formData.get("id"),
    name: formData.get("name"),
  }),
  success: (t) => t("Common.successfullySaved"),
});
