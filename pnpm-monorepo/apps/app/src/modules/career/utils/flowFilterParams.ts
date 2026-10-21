import { FlowStatus } from "@sam-monorepo/application";
import { parseAsString, parseAsStringEnum } from "nuqs/server";

export const FLOW_STATUS_PARAM = "status";
export const FLOW_QUERY_PARAM = "q";

export const flowStatusParser = parseAsStringEnum(
  Object.values(FlowStatus),
).withDefault(FlowStatus.Active);

export const flowFilterParsers = {
  [FLOW_STATUS_PARAM]: flowStatusParser,
  [FLOW_QUERY_PARAM]: parseAsString,
};
