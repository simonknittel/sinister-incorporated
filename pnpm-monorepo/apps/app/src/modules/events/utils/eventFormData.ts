import { toEventVisibilityType } from "@sam-monorepo/application";
import { EventVisibility } from "@sam-monorepo/database/client";
import * as z from "zod";

/**
 * The details of the create and the settings form in the input of
 * `createEvent()` and `updateEvent()`. An empty description removes it. The
 * times are the wall times of the `datetime-local` fields: the use cases
 * read them in the time zone of the organization.
 */
export const parseEventDetailsFormData = (formData: FormData) => ({
  name: formData.get("name"),
  description: formData.get("description") || null,
  start_time: formData.get("startTime"),
  end_time: formData.get("endTime"),
  visibility: toEventVisibilityType(
    z.enum(EventVisibility).parse(formData.get("visibility")),
  ),
  visibility_role_ids: formData.getAll("visibilityRole[]"),
});
