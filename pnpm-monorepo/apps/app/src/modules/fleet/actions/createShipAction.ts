"use server";

import { createUseCaseAction } from "@/modules/application";
import { createShip, createShipInputSchema } from "@sam-monorepo/application";

export const createShipAction = createUseCaseAction({
  name: "createShipAction",
  schema: createShipInputSchema,
  useCase: createShip,
  parseFormData: (formData) => ({
    variant_id: formData.get("variantId"),
    name: formData.has("name") ? formData.get("name") : undefined,
  }),
  success: (t) => t("Common.successfullySaved"),
});
