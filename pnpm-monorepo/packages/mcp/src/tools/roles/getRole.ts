import {
  canSeeAnyRole,
  getRole,
  getRoleInputSchema,
} from "@sam-monorepo/application";
import * as z from "zod";
import {
  defineTool,
  READ_ONLY_TOOL_ANNOTATIONS,
} from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import { roleOutputShape } from "./roleOutputSchema.js";

export const getRoleTool = defineTool({
  name: "get_role",
  group: ToolGroup.Roles,
  title: "Get a role",
  description:
    "Gives one role by its id (from list_roles or get_citizen): the fields of list_roles, the inactivity rules and, only with the permission to manage roles, the permission strings. A role that the user cannot see gives a NotFoundError.",
  annotations: READ_ONLY_TOOL_ANNOTATIONS,
  inputSchema: getRoleInputSchema,
  outputSchema: z.strictObject({
    ...roleOutputShape,
    max_age_days: z
      .int()
      .nullable()
      .describe(
        "The number of days of inactivity after which a citizen loses the role, or null.",
      ),
    assign_after_inactive_days: z
      .int()
      .nullable()
      .describe(
        "The number of days of inactivity after which a citizen gets the role automatically, or null.",
      ),
    permission_strings: z
      .array(z.string())
      .nullable()
      .describe(
        "The permissions that the role gives, for example otherRole;read;roleId=<role id>. Null without the permission to manage roles.",
      ),
  }),
  isVisible: canSeeAnyRole,
  handler: getRole,
});
