import { getApplicationContext, toActor } from "@/modules/application";
import {
  ForbiddenError,
  listOwnOnSiteNotifications,
  listOwnOnSiteNotificationsInputSchema,
  ValidationError,
} from "@sam-monorepo/application";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, toTrpcError } from "../../trpc";

/**
 * Pages through the current citizen's on-site notifications, newest first.
 * The inbox tab lists unarchived notifications, the archive tab archived
 * ones. Loaded lazily on first popover open; payload validation happens
 * client-side via the shared schemas (same code path as realtime events).
 */
export const list = protectedProcedure
  .input(listOwnOnSiteNotificationsInputSchema)
  .query(async ({ ctx, input }) => {
    try {
      return await listOwnOnSiteNotifications(
        getApplicationContext(),
        await toActor(ctx.session),
        input,
      );
    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new TRPCError({ code: "FORBIDDEN", message: "Missing citizen" });

      if (error instanceof ValidationError)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown cursor" });

      throw toTrpcError(error, "Failed to load on-site notifications");
    }
  });
