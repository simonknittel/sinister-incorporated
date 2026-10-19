import { ACTIVE_CITIZEN_WHERE } from "@sam-monorepo/domain";
import { collectWikiRoleCitizensRoleIds } from "@sam-monorepo/wiki-editor";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { findVisibleRoleBadges, type RoleBadge } from "../roles/roleBadges.js";
import { WIKI_CITIZEN_SELECT, type WikiCitizen } from "./wikiCitizen.js";

/** Citizens without a handle go last: the citizen link shows their id */
const compareWikiRoleCitizens = (first: WikiCitizen, second: WikiCitizen) => {
  if (first.handle && second.handle)
    return first.handle.localeCompare(second.handle);
  if (first.handle) return -1;
  if (second.handle) return 1;

  return first.id.localeCompare(second.id);
};

/**
 * The citizens that hold the role. A role that the actor cannot see gives
 * no citizens, thus neither the role nor its members leak.
 */
const resolveWikiRoleCitizens = async (
  context: Pick<ApplicationContext, "prisma">,
  visibleRoles: readonly Pick<RoleBadge, "id" | "maxLevel">[],
  roleId: string,
): Promise<WikiCitizen[]> => {
  const role = visibleRoles.find((candidate) => candidate.id === roleId);
  if (!role) return [];

  /**
   * A role with levels counts only at its maximum level: the same rule as
   * the effective roles, thus the list shows the citizens that hold the
   * role, not all citizens that work towards it. Only direct assignments
   * count: a role that a different role inherits is not assigned to a
   * citizen.
   */
  const citizens = await context.prisma.citizen.findMany({
    where: {
      ...ACTIVE_CITIZEN_WHERE,
      roleAssignments: {
        some: {
          roleId: role.id,
          ...(role.maxLevel
            ? { currentLevel: { gte: role.maxLevel } }
            : undefined),
        },
      },
    },
    select: WIKI_CITIZEN_SELECT,
  });

  return citizens.toSorted(compareWikiRoleCitizens);
};

/**
 * The citizens of the role of a role-members node, for the node view of the
 * editor. The view loads them again after a change of the role. The ids are
 * content of the document, thus an unknown role gives no citizens.
 */
export const findWikiRoleCitizens = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Pick<Actor, "authorize">,
  { roleId }: { readonly roleId: string },
): Promise<WikiCitizen[]> =>
  resolveWikiRoleCitizens(
    context,
    await findVisibleRoleBadges(context, actor),
    roleId,
  );

/**
 * The citizens of each role-members node of the content, by role, for the
 * static render and as the first data of the node views. The visible roles
 * load one time for all nodes.
 */
export const loadWikiRoleCitizensByRole = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Pick<Actor, "authorize">,
  content: unknown,
): Promise<Record<string, WikiCitizen[]>> => {
  const roleIds = collectWikiRoleCitizensRoleIds(content);
  if (roleIds.length === 0) return {};

  const visibleRoles = await findVisibleRoleBadges(context, actor);

  return Object.fromEntries(
    await Promise.all(
      roleIds.map(
        async (roleId) =>
          [
            roleId,
            await resolveWikiRoleCitizens(context, visibleRoles, roleId),
          ] as const,
      ),
    ),
  );
};
