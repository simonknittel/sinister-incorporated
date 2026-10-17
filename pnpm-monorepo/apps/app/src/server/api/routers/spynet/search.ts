import { getApplicationContext, toActor } from "@/modules/application";
import {
  ForbiddenError,
  searchCitizensAndOrganizations,
  searchCitizensAndOrganizationsInputSchema,
} from "@sam-monorepo/application";
import { protectedProcedure, toTrpcError } from "../../trpc";

/**
 * Search-as-you-type over citizens and organizations, for the Spynet search
 * tile and the Cmd+K search. Each result type requires its own read
 * permission, thus a viewer without both permissions gets no results.
 */
export const search = protectedProcedure
  .input(searchCitizensAndOrganizationsInputSchema)
  .query(async ({ ctx, input }) => {
    try {
      const { hits } = await searchCitizensAndOrganizations(
        getApplicationContext(),
        await toActor(ctx.session),
        input,
      );

      return hits;
    } catch (error) {
      if (error instanceof ForbiddenError) return [];

      throw toTrpcError(error, "Failed to search Spynet");
    }
  });
