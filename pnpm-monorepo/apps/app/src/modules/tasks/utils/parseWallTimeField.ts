import { wallTimeSchema } from "@/modules/common/utils/wallTimeSchema";

/**
 * The wall time of a `datetime-local` field as the ISO 8601 instant that the
 * task use cases take, or null for an empty field. Throws for a value that
 * is not a wall time: the action then responds with a bad request.
 */
export const parseWallTimeField = (formData: FormData, name: string) => {
  const value = formData.get(name);
  if (!value) return null;

  return wallTimeSchema.parse(value).toISOString();
};
