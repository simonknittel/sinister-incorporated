import { UploadUsageType } from "@sam-monorepo/domain";
import { parseAsArrayOf, parseAsString, parseAsStringEnum } from "nuqs/server";

export const UPLOAD_USAGE_PARAM = "usage";
export const UPLOAD_FROM_PARAM = "from";
export const UPLOAD_TO_PARAM = "to";
export const UPLOAD_QUERY_PARAM = "q";
export const UPLOAD_AUTHOR_PARAM = "createdById";

const uploadUsageParser = parseAsArrayOf(
  parseAsStringEnum(Object.values(UploadUsageType)),
);

export const uploadFilterParsers = {
  [UPLOAD_USAGE_PARAM]: uploadUsageParser,
  [UPLOAD_FROM_PARAM]: parseAsString,
  [UPLOAD_TO_PARAM]: parseAsString,
  [UPLOAD_QUERY_PARAM]: parseAsString,
  [UPLOAD_AUTHOR_PARAM]: parseAsArrayOf(parseAsString),
};
