import { createCursorPaginationLoader } from "@/modules/common/CursorPagination/createCursorPaginationLoader";
import { UserBanStatus, UserSort } from "@sam-monorepo/application";
import { parseAsString, parseAsStringEnum } from "nuqs/server";

/**
 * Only server components import this file. The barrel of the package
 * `application` is server code, thus a client module must not import a value
 * from it.
 */
export { UserBanStatus, UserSort };

export const loadUserListSearchParams = createCursorPaginationLoader({
  sort: parseAsStringEnum(Object.values(UserSort)).withDefault(
    UserSort.CreatedAtDesc,
  ),
  q: parseAsString,
  banned: parseAsStringEnum(Object.values(UserBanStatus)).withDefault(
    UserBanStatus.All,
  ),
});
