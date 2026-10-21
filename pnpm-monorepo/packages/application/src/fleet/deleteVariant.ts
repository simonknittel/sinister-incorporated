import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { rethrowRecordNotFound } from "../errors.js";
import { idSchema } from "../pagination.js";
import { FleetCatalogErrorMessage } from "./fleetCatalogErrors.js";

export const deleteVariantInputSchema = z.object({
  variant_id: idSchema,
});

export interface DeleteVariantOutput {
  readonly id: string;
  readonly series_id: string;
  readonly name: string;
}

/**
 * Deletes a variant. The database deletes the ships of all owners of the
 * variant with it.
 *
 * @throws NotFoundError when the variant does not exist
 */
export const deleteVariant = async (
  context: ApplicationContext,
  actor: Actor,
  input: z.infer<typeof deleteVariantInputSchema>,
): Promise<DeleteVariantOutput> => {
  requirePermission(actor, "manufacturersSeriesAndVariants", "manage");

  const variant = await rethrowRecordNotFound(
    () =>
      context.prisma.variant.delete({
        where: { id: input.variant_id },
        select: { id: true, seriesId: true, name: true },
      }),
    FleetCatalogErrorMessage.VariantNotFound,
  );

  await context.audit.create([
    {
      type: AuditEventType.VARIANT_DELETED,
      data: {
        variantId: variant.id,
        seriesId: variant.seriesId,
        name: variant.name,
      },
      createdById: actor.userId,
    },
  ]);

  return { id: variant.id, series_id: variant.seriesId, name: variant.name };
};
