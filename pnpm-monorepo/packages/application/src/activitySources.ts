import type { MergedCursorSourceInput } from "@sam-monorepo/domain";

/** One page request of a source of an activity table */
export interface ActivitySourceInput extends MergedCursorSourceInput {
  /** The key of the source in the merged cursor */
  readonly sourceKey: string;
  /** Only the entries of these citizens. Null or nothing: all citizens. */
  readonly actorIds?: readonly string[] | null;
  readonly createdAt?: { readonly gte?: Date; readonly lt?: Date };
}

/**
 * The conditions of the actor filter and of the date range of an activity
 * table. `actorColumn` is the column of the citizen who caused the entry.
 */
export const toActivityFilterWhere = <ActorColumn extends string>(
  { actorIds, createdAt }: Pick<ActivitySourceInput, "actorIds" | "createdAt">,
  actorColumn: ActorColumn,
) => ({
  ...(actorIds
    ? /** A computed key of a type parameter widens to `string` without it */
      ({ [actorColumn]: { in: [...actorIds] } } as Record<
        ActorColumn,
        { in: string[] }
      >)
    : {}),
  ...(createdAt && Object.keys(createdAt).length > 0 ? { createdAt } : {}),
});
