import { getApplicationContext, toActor } from "@/modules/application";
import { listCitizensGroupedByVisibleRoles } from "@sam-monorepo/application";
import { protectedProcedure, toTrpcError } from "../../trpc";

export const getCitizensGroupedByVisibleRoles = protectedProcedure.query(
  async ({ ctx }) => {
    try {
      return await listCitizensGroupedByVisibleRoles(
        getApplicationContext(),
        await toActor(ctx.session),
      );
    } catch (error) {
      throw toTrpcError(error, "Failed to fetch citizens");
    }
  },
);
