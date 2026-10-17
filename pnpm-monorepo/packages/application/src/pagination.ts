import { CursorDirection } from "@sam-monorepo/domain";
import * as z from "zod";
import { ValidationError } from "./errors.js";

/** The page size of a list when the caller does not give one */
export const DEFAULT_PAGE_LIMIT = 25;

/** A list never gives more items than this in one call */
export const MAXIMUM_PAGE_LIMIT = 100;

/**
 * A cursor is an id, a key or a merged cursor (a date, a source key and an
 * id, see `encodeCursor` of the domain package). These are much shorter.
 */
const MAXIMUM_CURSOR_LENGTH = 256;

export const pageLimitSchema = z
  .int()
  .min(1)
  .max(MAXIMUM_PAGE_LIMIT)
  .default(DEFAULT_PAGE_LIMIT)
  .describe("The maximum number of items in the result.");

export const cursorSchema = z
  .string()
  .min(1)
  .max(MAXIMUM_CURSOR_LENGTH)
  .describe("The next_cursor of the previous result.");

/**
 * The id of a row. The older tables make their ids with `cuid()` (25
 * characters), the newer tables with `cuid(2)` (at most 32 characters). Both
 * formats contain only lowercase letters and digits, thus one pattern accepts
 * both.
 */
export const idSchema = z
  .string()
  .regex(/^[a-z0-9]{1,32}$/)
  .describe("An id from an earlier result.");

/** What a list that sorts in memory does with a cursor that no item has */
export enum UnknownCursorBehavior {
  /** A `ValidationError`: the MCP tools send only the cursors of a result */
  Reject = "reject",
  /**
   * The first page, or the last page for `CursorDirection.Prev`: the cursor
   * in the URL of an app page goes stale when its item disappears
   */
  FirstPage = "first_page",
}

/**
 * The options of a list for the app: the app pages in both directions and
 * keeps a page with a stale cursor usable. The MCP tools page only forward
 * and use the defaults.
 */
export interface PageOptions {
  readonly direction?: CursorDirection;
  /** Only the lists that sort in memory use it */
  readonly unknownCursor?: UnknownCursorBehavior;
}

interface CursorPageOptions<Item> extends PageOptions {
  readonly cursor?: string | null;
  readonly pageSize: number;
  readonly getCursor: (item: Item) => string;
}

export interface CursorPage<Item> {
  readonly items: Item[];
  readonly nextCursor: string | null;
  readonly previousCursor: string | null;
}

/**
 * The cursor pagination of the lists that sort in memory: takes one page
 * (and one more item that tells if there are more) from the sorted list and
 * gives the cursors of the next and of the previous page.
 *
 * @throws ValidationError when no item has the cursor and `unknownCursor` is
 * `UnknownCursorBehavior.Reject` (the default)
 */
export const paginateByCursor = <Item>(
  sortedItems: readonly Item[],
  {
    cursor,
    direction = CursorDirection.Next,
    unknownCursor = UnknownCursorBehavior.Reject,
    pageSize,
    getCursor,
  }: CursorPageOptions<Item>,
): CursorPage<Item> => {
  let pageItems: Item[];

  if (cursor) {
    const cursorIndex = sortedItems.findIndex(
      (item) => getCursor(item) === cursor,
    );
    if (cursorIndex === -1 && unknownCursor === UnknownCursorBehavior.Reject)
      throw new ValidationError("Unknown cursor");

    if (direction === CursorDirection.Next) {
      // An unknown cursor starts at the first item
      const fromIndex = cursorIndex + 1;
      pageItems = sortedItems.slice(fromIndex, fromIndex + pageSize + 1);
    } else {
      // An unknown cursor ends at the last item
      const toIndex = cursorIndex === -1 ? sortedItems.length : cursorIndex;
      pageItems = sortedItems.slice(
        Math.max(0, toIndex - pageSize - 1),
        toIndex,
      );
    }
  } else {
    pageItems = sortedItems.slice(0, pageSize + 1);
  }

  const hasMore = pageItems.length > pageSize;

  let items = pageItems;
  if (hasMore)
    items =
      direction === CursorDirection.Next
        ? pageItems.slice(0, pageSize)
        : pageItems.slice(1);

  const hasNextPage =
    direction === CursorDirection.Next ? hasMore : Boolean(cursor);
  const hasPreviousPage =
    direction === CursorDirection.Prev ? hasMore : Boolean(cursor);
  const firstItem = items.at(0);
  const lastItem = items.at(-1);

  return {
    items,
    nextCursor: hasNextPage && lastItem ? getCursor(lastItem) : null,
    previousCursor: hasPreviousPage && firstItem ? getCursor(firstItem) : null,
  };
};
