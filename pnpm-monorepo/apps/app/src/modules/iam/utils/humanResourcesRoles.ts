import * as z from "zod";

/** Usually only a few roles are Human Resources. The limit stops a very large list. */
export const MAX_HUMAN_RESOURCES_ROLES = 20;

export const humanResourcesRoleIdsSchema = z
  .array(z.cuid())
  .max(MAX_HUMAN_RESOURCES_ROLES);
