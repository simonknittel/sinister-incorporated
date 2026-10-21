import { getApplicationContext, toActor } from "@/modules/application";
import {
  findManufacturerSeriesRows,
  ForbiddenError,
  idSchema,
} from "@sam-monorepo/application";
import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { protectedProcedure, toTrpcError } from "../../trpc";

export const getSeriesByManufacturerId = protectedProcedure
  .input(z.object({ manufacturerId: idSchema }))
  .query(async ({ ctx, input }) => {
    try {
      const series = await findManufacturerSeriesRows(
        getApplicationContext(),
        await toActor(ctx.session),
        { manufacturerId: input.manufacturerId },
      );

      return series.map(({ id, name, manufacturerId }) => ({
        id,
        name,
        manufacturerId,
      }));
    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new TRPCError({ code: "FORBIDDEN", message: error.message });

      throw toTrpcError(error, "Failed to load the series");
    }
  });
