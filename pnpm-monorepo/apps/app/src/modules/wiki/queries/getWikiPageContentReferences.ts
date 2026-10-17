import { prisma } from "@/db";
import { authenticate } from "@/modules/auth/server";
import { getPublicUploadBaseUrl } from "@/modules/common/utils/getPublicUploadUrl";
import {
  loadWikiLinkedVariants,
  loadWikiMentionedCitizens,
} from "@sam-monorepo/application";
import {
  collectWikiRoleCitizensRoleIds,
  type WikiLinkedVariant,
  type WikiMentionedCitizen,
} from "@sam-monorepo/wiki-editor";
import type { WikiRoleCitizen } from "../components/WikiRoleCitizensList";
import { resolveWikiRoleCitizens } from "../utils/resolveWikiRoleCitizens";

/**
 * Resolvers for the references a page's content can carry (mentions, ship
 * links, role-member nodes). Independent of the wiki scope — shared by the
 * global and the event wiki's static content queries.
 */

/** See `loadWikiMentionedCitizens()` */
export const getWikiMentionedCitizens = async (
  content: unknown,
): Promise<Record<string, WikiMentionedCitizen>> => {
  const authentication = await authenticate();
  const canReadCitizens = Boolean(
    authentication && (await authentication.authorize("citizen", "read")),
  );

  return loadWikiMentionedCitizens(prisma, canReadCitizens, content);
};

/**
 * See `loadWikiLinkedVariants()`. Links inserted after this render resolve
 * themselves client-side (see WikiVariantLinkNodeView).
 */
export const getWikiLinkedVariants = (
  content: unknown,
): Promise<Record<string, WikiLinkedVariant>> =>
  loadWikiLinkedVariants(prisma, content, getPublicUploadBaseUrl());

/**
 * Members of the role-member nodes on this page, resolved for this viewer —
 * for the static render and as the editor node views' initial data; the
 * node views refetch so role changes show up without a reload.
 */
export const getWikiRoleCitizensByRole = async (
  content: unknown,
): Promise<Record<string, WikiRoleCitizen[]>> =>
  Object.fromEntries(
    await Promise.all(
      collectWikiRoleCitizensRoleIds(content).map(
        async (roleId) =>
          [roleId, await resolveWikiRoleCitizens(roleId)] as const,
      ),
    ),
  );
