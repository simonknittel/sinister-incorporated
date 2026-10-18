import { SessionSort, SessionStatus } from "@sam-monorepo/application";
import { parseAsStringEnum } from "nuqs/server";

// Only server components import this file. A client component must not
// import a value from the application package.
export { SessionSort, SessionStatus };

export const SESSION_STATUS_PARAM = "status";
export const SESSION_SORT_PARAM = "sort";

export const sessionStatusParser = parseAsStringEnum(
  Object.values(SessionStatus),
).withDefault(SessionStatus.Active);

export const sessionSortParser = parseAsStringEnum(
  Object.values(SessionSort),
).withDefault(SessionSort.NewestFirst);
