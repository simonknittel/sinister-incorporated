import { VariantStatus } from "@sam-monorepo/database/browser";
import type { Prisma } from "@sam-monorepo/database/client";
import { ExternalService } from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ValidationError } from "../errors.js";
import { idSchema } from "../pagination.js";
import {
  getAccessibleWikiPage,
  WikiPageAccessTier,
} from "../wiki/getAccessibleWikiPage.js";
import { buildWikiContext } from "../wiki/wikiContext.js";
import { FleetCatalogErrorMessage } from "./fleetCatalogErrors.js";
import { VARIANT_TAG_SELECT } from "./shipVariant.js";

/** The length of the name field of the variant forms */
export const MAXIMUM_VARIANT_NAME_LENGTH = 255;

/**
 * The tag rows and the link rows of one variant form. A variant has few tags,
 * and one link for each external service.
 */
const MAXIMUM_VARIANT_FORM_ROWS = 50;

const formRowsSchema = z
  .array(z.string().trim())
  .max(MAXIMUM_VARIANT_FORM_ROWS);

/**
 * The fields of the variant forms that the create and the update share. The
 * tag keys and the tag values are pairs by their position, the same for the
 * services and the URLs of the links.
 */
export const variantFieldsInputShape = {
  status: z
    .enum([VariantStatus.FLIGHT_READY, VariantStatus.NOT_FLIGHT_READY])
    .optional(),
  tag_keys: formRowsSchema.optional(),
  tag_values: formRowsSchema.optional(),
  link_service_names: z
    .array(z.enum(ExternalService))
    .max(MAXIMUM_VARIANT_FORM_ROWS)
    .nullish(),
  link_urls: z.array(z.httpUrl()).max(MAXIMUM_VARIANT_FORM_ROWS).nullish(),
  /** An empty value removes the link to the wiki page */
  wiki_page_id: z.union([idSchema, z.literal("")]).optional(),
};

/** The variant after a write */
export interface VariantOutput {
  readonly id: string;
  readonly series_id: string;
  readonly name: string;
  /** Null when nobody set the status of the variant */
  readonly status: VariantStatus | null;
  /** The wiki page that the variant page embeds */
  readonly wiki_page_id: string | null;
}

export const VARIANT_OUTPUT_SELECT = {
  id: true,
  seriesId: true,
  name: true,
  status: true,
  wikiPageId: true,
} as const satisfies Prisma.VariantSelect;

export const toVariantOutput = (
  variant: Prisma.VariantGetPayload<{ select: typeof VARIANT_OUTPUT_SELECT }>,
): VariantOutput => ({
  id: variant.id,
  series_id: variant.seriesId,
  name: variant.name,
  status: variant.status,
  wiki_page_id: variant.wikiPageId,
});

interface VariantTagPair {
  readonly key: string;
  readonly value: string;
}

/** An external link of a variant, also in the audit events */
export interface VariantLink {
  readonly serviceName: string;
  readonly url: string;
}

/** The tag pairs of the form. A pair without a key or a value is left out. */
export const toVariantTags = (
  tagKeys: readonly string[] = [],
  tagValues: readonly string[] = [],
): VariantTagPair[] =>
  tagKeys.flatMap((key, index) => {
    const value = tagValues[index];

    return key && value ? [{ key, value }] : [];
  });

/**
 * The ids of the tags, for the tags of the variant. Creates the tags that do
 * not exist yet. The same pair two times in one form fails with the unique
 * constraint of the tags.
 */
export const findOrCreateVariantTagIds = async (
  transaction: Prisma.TransactionClient,
  tags: readonly VariantTagPair[],
  authorCitizenId: string,
): Promise<string[]> => {
  if (tags.length === 0) return [];

  const existingTags = await transaction.variantTag.findMany({
    where: { OR: tags.map(({ key, value }) => ({ key, value })) },
    select: VARIANT_TAG_SELECT,
  });

  const missingTags = tags.filter(
    (tag) =>
      !existingTags.some(
        (existingTag) =>
          existingTag.key === tag.key && existingTag.value === tag.value,
      ),
  );

  const createdTags = await transaction.variantTag.createManyAndReturn({
    data: missingTags.map(({ key, value }) => ({
      key,
      value,
      createdById: authorCitizenId,
    })),
    select: { id: true },
  });

  return [
    ...existingTags.map((tag) => tag.id),
    ...createdTags.map((tag) => tag.id),
  ];
};

/**
 * The links of the form. A link without a service or a URL is left out.
 * Undefined when the form has no link rows.
 */
export const toVariantLinks = (
  serviceNames: readonly ExternalService[] | null | undefined,
  urls: readonly string[] | null | undefined,
): VariantLink[] | undefined =>
  serviceNames?.flatMap((serviceName, index) => {
    const url = urls?.[index];

    return serviceName && url ? [{ serviceName, url }] : [];
  });

/**
 * Makes the external links of the variant the given links: one link for each
 * service. Keeps the row of a service that stays, thus its creator stays.
 */
export const syncVariantExternalLinks = async (
  transaction: Prisma.TransactionClient,
  variantId: string,
  links: readonly VariantLink[] | undefined,
  authorCitizenId: string,
) => {
  if (!links || links.length === 0) {
    await transaction.variantExternalLink.deleteMany({ where: { variantId } });
    return;
  }

  const existingLinks = await transaction.variantExternalLink.findMany({
    where: { variantId },
    select: { id: true, serviceName: true },
  });

  const serviceNames = new Set(links.map((link) => link.serviceName));
  const removedLinks = existingLinks.filter(
    (existingLink) => !serviceNames.has(existingLink.serviceName),
  );
  if (removedLinks.length > 0)
    await transaction.variantExternalLink.deleteMany({
      where: { id: { in: removedLinks.map((link) => link.id) } },
    });

  // An interactive transaction runs one statement at a time
  for (const link of links) {
    const existingLink = existingLinks.find(
      (candidate) => candidate.serviceName === link.serviceName,
    );

    if (existingLink)
      await transaction.variantExternalLink.update({
        where: { id: existingLink.id },
        data: { url: link.url, updatedById: authorCitizenId },
      });
    else
      await transaction.variantExternalLink.create({
        data: {
          variantId,
          serviceName: link.serviceName,
          url: link.url,
          createdById: authorCitizenId,
          updatedById: authorCitizenId,
        },
      });
  }
};

/**
 * The linked page of a variant must be a page of the global wiki that the
 * actor can read.
 *
 * @throws ValidationError for an unknown page, a page in the trash and a page
 * that the actor cannot read alike, thus the existence of a page never leaks
 */
export const requireReadableGlobalWikiPage = async (
  context: ApplicationContext,
  actor: Actor,
  pageId: string,
) => {
  const wikiContext = await buildWikiContext(context, actor);

  if (!getAccessibleWikiPage(wikiContext, pageId, WikiPageAccessTier.Read))
    throw new ValidationError(FleetCatalogErrorMessage.WikiPageNotReadable);
};
