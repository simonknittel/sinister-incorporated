import { MAX_HUMAN_RESOURCES_ROLES } from "@sam-monorepo/domain";
import * as z from "zod";
import { idSchema } from "../pagination.js";

export const humanResourcesRoleIdsSchema = z
  .array(idSchema)
  .max(MAX_HUMAN_RESOURCES_ROLES);

/**
 * The role ids of the stored setting value. A value of a different shape
 * gives an empty list.
 */
export const parseHumanResourcesRoleIds = (value: unknown): string[] => {
  const parsed = humanResourcesRoleIdsSchema.safeParse(value);

  return parsed.success ? parsed.data : [];
};
