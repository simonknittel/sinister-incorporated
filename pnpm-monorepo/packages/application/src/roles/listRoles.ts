import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import {
  cursorSchema,
  pageLimitSchema,
  paginateByCursor,
} from "../pagination.js";
import {
  ROLE_OUTPUT_SELECT,
  toRoleOutput,
  type RoleOutput,
} from "./roleOutput.js";
import { compareRoleNames, isRoleVisible } from "./roleVisibility.js";

/** The role names are much shorter */
const MAXIMUM_QUERY_LENGTH = 100;

export const listRolesInputSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1)
    .max(MAXIMUM_QUERY_LENGTH)
    .optional()
    .describe("A part of the role name, without regard to the case."),
  limit: pageLimitSchema,
  cursor: cursorSchema.optional(),
});

export type ListRolesInput = z.output<typeof listRolesInputSchema>;

export interface ListRolesOutput {
  readonly roles: RoleOutput[];
  readonly next_cursor: string | null;
}

/**
 * The roles that the actor can see (see `isRoleVisible()`), sorted by name,
 * one page. The cursor is the id of a role.
 *
 * @throws ValidationError when no role of the list has the cursor
 */
export const listRoles = async (
  context: ApplicationContext,
  actor: Actor,
  input: ListRolesInput,
): Promise<ListRolesOutput> => {
  const roles = await context.prisma.role.findMany({
    where: input.query
      ? { name: { contains: input.query, mode: "insensitive" } }
      : {},
    select: ROLE_OUTPUT_SELECT,
  });

  const page = paginateByCursor(
    roles
      .filter((role) => isRoleVisible(actor, role.id))
      .toSorted(compareRoleNames),
    {
      cursor: input.cursor,
      pageSize: input.limit,
      getCursor: (role) => role.id,
    },
  );

  return {
    roles: page.items.map((role) => toRoleOutput(context, actor, role)),
    next_cursor: page.nextCursor,
  };
};
