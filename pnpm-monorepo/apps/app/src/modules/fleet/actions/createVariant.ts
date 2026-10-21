"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  createVariantInputSchema,
  createVariant as createVariantUseCase,
} from "@sam-monorepo/application";

/** The hidden field `manufacturerId` of the form is not an input */
export const createVariant = createUseCaseAction({
  name: "createVariant",
  schema: createVariantInputSchema,
  useCase: createVariantUseCase,
  parseFormData: (formData) => ({
    series_id: formData.get("seriesId"),
    name: formData.get("name"),
    status: formData.has("status") ? formData.get("status") : undefined,
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
