import { getApplicationContext, toActor } from "@/modules/application";
import {
  getCitizenProfile,
  idSchema,
  NotFoundError,
} from "@sam-monorepo/application";
import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { protectedProcedure, toTrpcError } from "../../trpc";

export const getCitizenById = protectedProcedure
  .input(z.object({ id: idSchema }))
  .query(async ({ ctx, input }) => {
    try {
      return await getCitizenProfile(
        getApplicationContext(),
        await toActor(ctx.session),
        { citizen_id: input.id },
      );
    } catch (error) {
      if (error instanceof NotFoundError)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Citizen not found",
        });

      throw toTrpcError(error, "Failed to fetch citizen by ID");
    }
  });
