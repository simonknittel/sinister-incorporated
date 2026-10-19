import { getCitizenDisplayName } from "@sam-monorepo/domain";
import {
  collectWikiMentionedCitizenIds,
  collectWikiVariantLinkIds,
  type WikiLinkedVariant,
  type WikiMentionedCitizen,
} from "@sam-monorepo/wiki-editor";
import type { ApplicationContext } from "../context.js";

/**
 * Resolvers for the references a page's content can carry (mentions, ship
 * links). Independent of the wiki scope — shared by the global and the event
 * wiki.
 */

/**
 * Current handles of the citizens mentioned in the content, so mentions
 * follow handle changes. Mentions inserted after this render fall back to
 * the handle stored in the document. Viewers without the citizen read
 * permission get these insertion-time handles instead of live ones. A
 * deleted citizen shows the deleted label for each viewer, also instead of
 * the stored handle.
 *
 * @param canReadCitizens Whether the reader has `citizen;read`
 */
export const loadWikiMentionedCitizens = async (
  prisma: ApplicationContext["prisma"],
  canReadCitizens: boolean,
  content: unknown,
): Promise<Record<string, WikiMentionedCitizen>> => {
  const mentionedCitizenIds = collectWikiMentionedCitizenIds(content);
  if (mentionedCitizenIds.length === 0) return {};

  const citizens = await prisma.citizen.findMany({
    where: { id: { in: mentionedCitizenIds } },
    select: { id: true, deletedAt: true, handle: canReadCitizens },
  });

  return Object.fromEntries(
    citizens.map((citizen) => [
      citizen.id,
      {
        handle:
          citizen.deletedAt || canReadCitizens
            ? getCitizenDisplayName(citizen)
            : null,
        deleted: citizen.deletedAt !== null,
      },
    ]),
  );
};

/**
 * Current names and manufacturer logos of the variants linked in the
 * content, so links follow renames. Deliberately not permission-filtered:
 * the wiki shows every reader which ship is meant — only the variant page
 * itself stays gated.
 *
 * @param publicUploadBaseUrl The public base URL of the uploads, for the
 * logos
 */
export const loadWikiLinkedVariants = async (
  prisma: ApplicationContext["prisma"],
  content: unknown,
  publicUploadBaseUrl: string,
): Promise<Record<string, WikiLinkedVariant>> => {
  const linkedVariantIds = collectWikiVariantLinkIds(content);
  if (linkedVariantIds.length === 0) return {};

  const variants = await prisma.variant.findMany({
    where: { id: { in: linkedVariantIds } },
    select: {
      id: true,
      name: true,
      series: {
        select: {
          manufacturer: {
            select: {
              name: true,
              image: { select: { id: true, mimeType: true } },
            },
          },
        },
      },
    },
  });

  return Object.fromEntries(
    variants.map((variant) => {
      const { manufacturer } = variant.series;

      return [
        variant.id,
        {
          name: variant.name,
          manufacturerName: manufacturer.name,
          logo: manufacturer.image
            ? {
                src: `${publicUploadBaseUrl}/${manufacturer.image.id}`,
                mimeType: manufacturer.image.mimeType,
              }
            : undefined,
        },
      ];
    }),
  );
};
