import { getApplicationContext, toActor } from "@/modules/application";
import { findUsableEventTemplates } from "@sam-monorepo/application";
import { protectedProcedure, toTrpcError } from "../../trpc";

/**
 * The templates the current viewer may create an event from, with everything
 * the create form prefills. Loaded lazily by the form, which only mounts
 * while the modal is open.
 */
export const getUsableEventTemplates = protectedProcedure.query(
  async ({ ctx }) => {
    try {
      return await findUsableEventTemplates(
        getApplicationContext(),
        await toActor(ctx.session),
      );
    } catch (error) {
      throw toTrpcError(error, "Failed to fetch usable event templates");
    }
  },
);
