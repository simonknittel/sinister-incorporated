import { getApplicationContext, toActor } from "@/modules/application";
import { log } from "@/modules/logging";
import { findPublishableDiscordChannels } from "@sam-monorepo/application";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";

/**
 * The guild's voice and stage channels a new event can be published into.
 * Loaded lazily by the create-event form, which only mounts while the modal
 * is open. Null means Discord could not be asked — the form says so rather
 * than showing an empty picker.
 *
 * Gated on `event;create`, the permission the form itself needs: the bot
 * sees channels the caller may not, and every call is an uncached request
 * against the bot's shared Discord rate limit. The use case has no check of
 * its own (see `findPublishableDiscordChannels()`).
 */
export const getPublishableDiscordChannels = protectedProcedure.query(
  async ({ ctx }) => {
    if (!(await toActor(ctx.session)).authorize("event", "create"))
      throw new TRPCError({ code: "FORBIDDEN" });

    try {
      return await findPublishableDiscordChannels(getApplicationContext());
    } catch (error) {
      log.error("Failed to fetch publishable Discord channels", {
        error,
      });

      return null;
    }
  },
);
