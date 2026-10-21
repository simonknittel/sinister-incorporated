import { getApplicationContext } from "@/modules/application";
import { findVariantLinkOptions } from "@sam-monorepo/application";
import { protectedProcedure, toTrpcError } from "../../trpc";

/** See `findVariantLinkOptions()` */
export const getAll = protectedProcedure.query(async () => {
  try {
    return await findVariantLinkOptions(getApplicationContext());
  } catch (error) {
    throw toTrpcError(error, "Failed to load the variants");
  }
});
