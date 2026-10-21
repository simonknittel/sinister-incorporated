"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateVariantInputSchema,
  updateVariant as updateVariantUseCase,
} from "@sam-monorepo/application";

export const updateVariant = createUseCaseAction({
  name: "updateVariant",
  schema: updateVariantInputSchema,
  useCase: updateVariantUseCase,
  parseFormData: (formData) => ({
    variant_id: formData.get("id"),
    name: formData.get("name"),
    status: formData.get("status"),
    wiki_page_id: formData.has("wikiPageId")
      ? formData.get("wikiPageId")
      : undefined,
    tag_keys: formData.has("tagKeys[]")
      ? formData.getAll("tagKeys[]")
      : undefined,
    tag_values: formData.has("tagValues[]")
      ? formData.getAll("tagValues[]")
      : undefined,
    link_service_names: formData.has("linkServiceNames[]")
      ? formData.getAll("linkServiceNames[]")
      : undefined,
    link_urls: formData.has("linkUrls[]")
      ? formData.getAll("linkUrls[]")
      : undefined,
  }),
  success: (t) => t("Common.successfullySaved"),
});
