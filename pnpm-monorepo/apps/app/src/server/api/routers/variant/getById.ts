import { getApplicationContext, toActor } from "@/modules/application";
import {
  findManagedVariant,
  ForbiddenError,
  idSchema,
} from "@sam-monorepo/application";
import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { protectedProcedure, toTrpcError } from "../../trpc";

/** For the update modal of a variant, see `findManagedVariant()` */
export const getById = protectedProcedure
  .input(z.object({ id: idSchema }))
  .query(async ({ ctx, input }) => {
    try {
      return await findManagedVariant(
        getApplicationContext(),
        await toActor(ctx.session),
        { variantId: input.id },
      );
    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new TRPCError({ code: "FORBIDDEN", message: error.message });

      throw toTrpcError(error, "Failed to load the variant");
    }
  });
