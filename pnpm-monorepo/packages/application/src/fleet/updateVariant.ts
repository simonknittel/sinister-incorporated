import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError, rethrowRecordNotFound } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { catalogNameSchema } from "./catalogName.js";
import { FleetCatalogErrorMessage } from "./fleetCatalogErrors.js";
import {
  findOrCreateVariantTagIds,
  requireReadableGlobalWikiPage,
  syncVariantExternalLinks,
  toVariantLinks,
  toVariantOutput,
  toVariantTags,
  VARIANT_OUTPUT_SELECT,
  variantFieldsInputShape,
  type VariantOutput,
} from "./variantWrites.js";

export const updateVariantInputSchema = z.object({
  variant_id: idSchema,
  /** An absent name stays */
  name: catalogNameSchema.optional(),
  ...variantFieldsInputShape,
});

/**
 * Changes a variant. The tags and the external links of the variant become
 * the tags and the links of the input. A name that a different variant of
 * the series has already fails with the unique constraint of the names.
 *
 * @throws NotFoundError when the variant does not exist
 * @throws ValidationError when the actor cannot read a new wiki page
 */
export const updateVariant = (
  context: ApplicationContext,
  actor: Actor,
  input: z.infer<typeof updateVariantInputSchema>,
): Promise<VariantOutput> =>
  withSpan(context, "updateVariant", async () => {
    requirePermission(actor, "manufacturersSeriesAndVariants", "manage");
    const author = requireCitizen(actor);

    const existingVariant = await context.prisma.variant.findUnique({
      where: { id: input.variant_id },
      select: {
        name: true,
        status: true,
        wikiPageId: true,
        externalLinks: { select: { serviceName: true, url: true } },
      },
    });
    if (!existingVariant)
      throw new NotFoundError(FleetCatalogErrorMessage.VariantNotFound);

    /**
     * An absent page id keeps the link, an empty one removes it. Only a
     * changed link needs the read check: a manager who cannot read the
     * linked page can still save the other fields without removing the link.
     */
    const wikiPageId =
      input.wiki_page_id === undefined ? undefined : input.wiki_page_id || null;
    if (wikiPageId && wikiPageId !== existingVariant.wikiPageId)
      await requireReadableGlobalWikiPage(context, actor, wikiPageId);

    const links = toVariantLinks(input.link_service_names, input.link_urls);

    const variant = await context.prisma.$transaction(async (transaction) => {
      const tagIds = await findOrCreateVariantTagIds(
        transaction,
        toVariantTags(input.tag_keys, input.tag_values),
        author.id,
      );

      const updatedVariant = await rethrowRecordNotFound(
        () =>
          transaction.variant.update({
            where: { id: input.variant_id },
            data: {
              name: input.name,
              status: input.status,
              wikiPageId,
              tags: { set: tagIds.map((id) => ({ id })) },
            },
            select: VARIANT_OUTPUT_SELECT,
          }),
        FleetCatalogErrorMessage.VariantNotFound,
      );

      await syncVariantExternalLinks(
        transaction,
        updatedVariant.id,
        links,
        author.id,
      );

      return updatedVariant;
    });

    await context.audit.create([
      {
        type: AuditEventType.VARIANT_UPDATED_V3,
        data: {
          variantId: variant.id,
          seriesId: variant.seriesId,
          previousName: existingVariant.name,
          newName: variant.name,
          previousStatus: existingVariant.status,
          newStatus: variant.status,
          previousLinks: existingVariant.externalLinks,
          newLinks: links ?? [],
          previousWikiPageId: existingVariant.wikiPageId,
          newWikiPageId: variant.wikiPageId,
        },
        createdById: actor.userId,
      },
    ]);

    return toVariantOutput(variant);
  });
