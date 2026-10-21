/** All values of a repeated field, or undefined when the form does not send it */
const getAllValues = (formData: FormData, name: string) =>
  formData.has(name) ? formData.getAll(name) : undefined;

/**
 * The fields of the variant forms that the create and the update share. A
 * field that the form does not send stays absent.
 */
export const parseVariantFieldsFormData = (formData: FormData) => ({
  wiki_page_id: formData.has("wikiPageId")
    ? formData.get("wikiPageId")
    : undefined,
  tag_keys: getAllValues(formData, "tagKeys[]"),
  tag_values: getAllValues(formData, "tagValues[]"),
  link_service_names: getAllValues(formData, "linkServiceNames[]"),
  link_urls: getAllValues(formData, "linkUrls[]"),
});
