import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { FleetCatalogErrorMessage } from "./fleetCatalogErrors.js";
import {
  findOrCreateVariantTagIds,
  MAXIMUM_VARIANT_NAME_LENGTH,
  requireReadableGlobalWikiPage,
  syncVariantExternalLinks,
  toVariantLinks,
  toVariantOutput,
  toVariantTags,
  VARIANT_OUTPUT_SELECT,
  variantFieldsInputShape,
  type VariantOutput,
} from "./variantWrites.js";

export const createVariantInputSchema = z.object({
  series_id: idSchema,
  name: z.string().trim().min(1).max(MAXIMUM_VARIANT_NAME_LENGTH),
  ...variantFieldsInputShape,
});

/**
 * Adds a variant to a series, with its tags, its external links and the wiki
 * page that the variant page embeds. A name that a variant of the series has
 * already fails with the unique constraint of the names.
 *
 * @throws NotFoundError when the series does not exist
 * @throws ValidationError when the actor cannot read the wiki page
 */
export const createVariant = (
  context: ApplicationContext,
  actor: Actor,
  input: z.infer<typeof createVariantInputSchema>,
): Promise<VariantOutput> =>
  withSpan(context, "createVariant", async () => {
    requirePermission(actor, "manufacturersSeriesAndVariants", "manage");
    const author = requireCitizen(actor);

    const series = await context.prisma.series.findUnique({
      where: { id: input.series_id },
      select: { id: true },
    });
    if (!series)
      throw new NotFoundError(FleetCatalogErrorMessage.SeriesNotFound);

    const wikiPageId = input.wiki_page_id || null;
    if (wikiPageId)
      await requireReadableGlobalWikiPage(context, actor, wikiPageId);

    const links = toVariantLinks(input.link_service_names, input.link_urls);

    const variant = await context.prisma.$transaction(async (transaction) => {
      const tagIds = await findOrCreateVariantTagIds(
        transaction,
        toVariantTags(input.tag_keys, input.tag_values),
        author.id,
      );

      const createdVariant = await transaction.variant.create({
        data: {
          seriesId: series.id,
          name: input.name,
          status: input.status,
          wikiPageId,
          ...(tagIds.length > 0 && {
            tags: { connect: tagIds.map((id) => ({ id })) },
          }),
        },
        select: VARIANT_OUTPUT_SELECT,
      });

      await syncVariantExternalLinks(
        transaction,
        createdVariant.id,
        links,
        author.id,
      );

      return createdVariant;
    });

    await context.audit.create([
      {
        type: AuditEventType.VARIANT_CREATED_V3,
        data: {
          variantId: variant.id,
          seriesId: variant.seriesId,
          name: variant.name,
          status: variant.status,
          links: links ?? [],
          wikiPageId: variant.wikiPageId,
        },
        createdById: actor.userId,
      },
    ]);

    return toVariantOutput(variant);
  });
