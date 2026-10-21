import { getApplicationContext, toActor } from "@/modules/application";
import { findManagedManufacturer, idSchema } from "@sam-monorepo/application";
import * as z from "zod";
import { protectedProcedure, toTrpcError } from "../../trpc";

export const getManufacturerById = protectedProcedure
  .input(z.object({ id: idSchema }))
  .query(async ({ ctx, input }) => {
    try {
      const manufacturer = await findManagedManufacturer(
        getApplicationContext(),
        await toActor(ctx.session),
        { manufacturerId: input.id },
      );

      return (
        manufacturer && {
          id: manufacturer.id,
          name: manufacturer.name,
          imageId: manufacturer.imageId,
        }
      );
    } catch (error) {
      throw toTrpcError(error, "Failed to load the manufacturer");
    }
  });
