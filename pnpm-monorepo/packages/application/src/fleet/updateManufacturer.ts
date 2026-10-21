import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError, rethrowRecordNotFound } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import type { ManufacturerOutput } from "./createManufacturer.js";
import { FleetCatalogErrorMessage } from "./fleetCatalogErrors.js";

export const updateManufacturerInputSchema = z.object({
  manufacturer_id: idSchema,
  /** An absent name stays */
  name: z.string().trim().min(1).optional(),
  /** An absent logo stays */
  image_id: idSchema.optional(),
});

export interface UpdateManufacturerOutput extends ManufacturerOutput {
  /** The upload of the logo */
  readonly image_id: string | null;
}

/**
 * Changes the name or the logo of a manufacturer. A name that a different
 * manufacturer has already fails with the unique constraint of the names.
 *
 * @throws NotFoundError when the manufacturer does not exist
 */
export const updateManufacturer = (
  context: ApplicationContext,
  actor: Actor,
  input: z.infer<typeof updateManufacturerInputSchema>,
): Promise<UpdateManufacturerOutput> =>
  withSpan(context, "updateManufacturer", async () => {
    requirePermission(actor, "manufacturersSeriesAndVariants", "manage");

    const existingManufacturer = await context.prisma.manufacturer.findUnique({
      where: { id: input.manufacturer_id },
      select: { name: true, imageId: true },
    });
    if (!existingManufacturer)
      throw new NotFoundError(FleetCatalogErrorMessage.ManufacturerNotFound);

    const manufacturer = await rethrowRecordNotFound(
      () =>
        context.prisma.manufacturer.update({
          where: { id: input.manufacturer_id },
          data: { name: input.name, imageId: input.image_id },
          select: { id: true, name: true, imageId: true },
        }),
      FleetCatalogErrorMessage.ManufacturerNotFound,
    );

    await context.audit.create([
      {
        type: AuditEventType.MANUFACTURER_UPDATED,
        data: {
          manufacturerId: manufacturer.id,
          previousName: existingManufacturer.name,
          newName: manufacturer.name,
          previousImageId: existingManufacturer.imageId || null,
          newImageId: manufacturer.imageId,
        },
        createdById: actor.userId,
      },
    ]);

    return {
      id: manufacturer.id,
      name: manufacturer.name,
      image_id: manufacturer.imageId,
    };
  });
