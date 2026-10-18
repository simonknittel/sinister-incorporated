interface FlatPosition {
  readonly id: string;
  readonly parentPositionId: string | null;
}

/**
 * The level of each position: 1 for a position on the top level, 2 for its
 * children and so on. A position in a cycle gets `Infinity`, thus it is
 * deeper than each limit.
 */
export const getPositionLevels = (
  positions: readonly FlatPosition[],
): Map<string, number> => {
  const parentIds = new Map(
    positions.map((position) => [position.id, position.parentPositionId]),
  );

  return new Map(
    positions.map((position) => {
      const visitedIds = new Set([position.id]);
      let level = 1;
      let parentId = position.parentPositionId;

      while (parentId !== null && parentIds.has(parentId)) {
        if (visitedIds.has(parentId)) return [position.id, Infinity];

        visitedIds.add(parentId);
        level += 1;
        parentId = parentIds.get(parentId) ?? null;
      }

      return [position.id, level];
    }),
  );
};
