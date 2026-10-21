import { getApplicationContext, toActor } from "@/modules/application";
import {
  findManagedManufacturer,
  ForbiddenError,
  idSchema,
} from "@sam-monorepo/application";
import { TRPCError } from "@trpc/server";
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
      if (error instanceof ForbiddenError)
        throw new TRPCError({ code: "FORBIDDEN", message: error.message });

      throw toTrpcError(error, "Failed to load the manufacturer");
    }
  });
