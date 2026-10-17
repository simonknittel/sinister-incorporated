import { wallTimeSchema } from "@/modules/common/utils/wallTimeSchema";
import { toEventVisibilityType } from "@sam-monorepo/application";
import { EventVisibility } from "@sam-monorepo/database/client";
import * as z from "zod";

/**
 * The wall time of a `datetime-local` field as the ISO 8601 instant that the
 * event use cases take. Throws for a value that is not a wall time: the
 * action then responds with a bad request.
 */
const parseWallTimeField = (formData: FormData, name: string) =>
  wallTimeSchema.parse(formData.get(name)).toISOString();

/**
 * The details of the create and the settings form in the input of
 * `createEvent()` and `updateEvent()`. An empty description removes it.
 */
export const parseEventDetailsFormData = (formData: FormData) => ({
  name: formData.get("name"),
  description: formData.get("description") || null,
  start_time: parseWallTimeField(formData, "startTime"),
  end_time: parseWallTimeField(formData, "endTime"),
  visibility: toEventVisibilityType(
    z.enum(EventVisibility).parse(formData.get("visibility")),
  ),
  visibility_role_ids: formData.getAll("visibilityRole[]"),
});
