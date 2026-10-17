import { CursorDirection } from "@sam-monorepo/domain";
import { parseAsString, parseAsStringEnum } from "nuqs/server";

export { CursorDirection };

export const cursorPaginationParsers = {
  cursor: parseAsString,
  direction: parseAsStringEnum(Object.values(CursorDirection)).withDefault(
    CursorDirection.Next,
  ),
};
