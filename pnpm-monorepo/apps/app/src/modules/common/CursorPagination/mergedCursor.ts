/** The merged cursor pagination lives in the domain package, thus the use cases of the application package use it too */
export {
  buildCursorConditions,
  compareMergedCursorEntries,
  cursorOrderBy,
  decodeCursor,
  encodeCursor,
  isBeyondCursorPosition,
  paginateMergedSources,
  type CursorCondition,
  type CursorPosition,
  type MergedCursorEntry,
  type MergedCursorSource,
  type MergedCursorSourceInput,
} from "@sam-monorepo/domain";
