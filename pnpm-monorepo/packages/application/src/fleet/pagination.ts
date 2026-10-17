import * as z from "zod";

/** The direction in which a list moves away from its cursor */
export enum PageDirection {
  Next = "next",
  Previous = "previous",
}

/** A list never gives more items than this in one call */
const MAXIMUM_PAGE_SIZE = 100;

/** The page size of a list when the caller does not give one */
const DEFAULT_PAGE_SIZE = 25;

/** A cursor is an id that a list gave before. Ids are much shorter. */
const MAXIMUM_CURSOR_LENGTH = 256;

/** The pagination fields of the input schema of a list */
export const pageInputShape = {
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAXIMUM_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  /** The `next_cursor` (or the `previous_cursor`) of an earlier page */
  cursor: z.string().min(1).max(MAXIMUM_CURSOR_LENGTH).optional(),
  direction: z.enum(PageDirection).default(PageDirection.Next),
};

interface CursorPageOptions<Item> {
  readonly cursor?: string | null;
  readonly direction: PageDirection;
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
 * gives the cursors of the next and of the previous page. An unknown cursor
 * gives the first (or the last) page.
 */
export const paginateByCursor = <Item>(
  sortedItems: readonly Item[],
  { cursor, direction, pageSize, getCursor }: CursorPageOptions<Item>,
): CursorPage<Item> => {
  let pageItems: Item[];

  if (!cursor) {
    pageItems = sortedItems.slice(0, pageSize + 1);
  } else if (direction === PageDirection.Next) {
    const cursorIndex = sortedItems.findIndex(
      (item) => getCursor(item) === cursor,
    );
    const fromIndex = cursorIndex !== -1 ? cursorIndex + 1 : 0;
    pageItems = sortedItems.slice(fromIndex, fromIndex + pageSize + 1);
  } else {
    const cursorIndex = sortedItems.findIndex(
      (item) => getCursor(item) === cursor,
    );
    const toIndex = cursorIndex !== -1 ? cursorIndex : sortedItems.length;
    const fromIndex = Math.max(0, toIndex - pageSize - 1);
    pageItems = sortedItems.slice(fromIndex, toIndex);
  }

  const hasMore = pageItems.length > pageSize;

  let items = pageItems;
  if (hasMore)
    items =
      direction === PageDirection.Next
        ? pageItems.slice(0, pageSize)
        : pageItems.slice(1);

  const hasNextPage =
    direction === PageDirection.Next ? hasMore : Boolean(cursor);
  const hasPreviousPage =
    direction === PageDirection.Previous ? hasMore : Boolean(cursor);
  const firstItem = items.at(0);
  const lastItem = items.at(-1);

  return {
    items,
    nextCursor: hasNextPage && lastItem ? getCursor(lastItem) : null,
    previousCursor: hasPreviousPage && firstItem ? getCursor(firstItem) : null,
  };
};
