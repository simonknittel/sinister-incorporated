import type { Prisma } from "@sam-monorepo/database/client";
import { UPLOAD_USAGE_RELATION_BY_TYPE } from "./uploadUsage.js";

/**
 * Matches uploads no usage relation references (see
 * `UPLOAD_USAGE_RELATION_BY_TYPE`). Both the cleanup's "may be deleted"
 * query and the upload manager's "Unbenutzt" filter are this.
 */
export const UNUSED_UPLOAD_WHERE: Prisma.UploadWhereInput = Object.fromEntries(
  Object.values(UPLOAD_USAGE_RELATION_BY_TYPE).map((relation) => [
    relation,
    { none: {} },
  ]),
);
