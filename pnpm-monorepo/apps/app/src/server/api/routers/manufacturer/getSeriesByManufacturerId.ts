import { getApplicationContext, toActor } from "@/modules/application";
import {
  findManufacturerSeriesRows,
  idSchema,
} from "@sam-monorepo/application";
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
      throw toTrpcError(error, "Failed to load the series");
    }
  });
