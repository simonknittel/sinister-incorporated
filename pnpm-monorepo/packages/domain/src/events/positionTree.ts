import type { EventPosition } from "@sam-monorepo/database/client";
import { LINEUP_MAX_DEPTH } from "./lineupLimits.js";

/** Where a paste puts the copy, relative to the target position */
export enum PastePlacement {
  /** Below the target, on the same level */
  After = "after",
  /** As the last children of the target */
  Inside = "inside",
}

interface PositionNode {
  childPositions?: PositionNode[];
}

/**
 * Number of levels a position occupies including its descendants. A position
 * without child positions has a depth of 1.
 */
export const getSubtreeDepth = (position: PositionNode): number => {
  if (!position.childPositions || position.childPositions.length <= 0) return 1;

  return (
    1 +
    Math.max(...position.childPositions.map((child) => getSubtreeDepth(child)))
  );
};

/**
 * Number of positions a position consists of including its descendants.
 */
export const getSubtreeSize = (position: PositionNode): number => {
  if (!position.childPositions) return 1;

  return position.childPositions.reduce(
    (total, child) => total + getSubtreeSize(child),
    1,
  );
};

/**
 * @param parentLevel Level of the position the subtree gets pasted into. `0`
 * when pasting on the top level, `1` when pasting into a top level position,
 * ...
 */
export const canPasteSubtree = (parentLevel: number, subtreeDepth: number) =>
  parentLevel + subtreeDepth <= LINEUP_MAX_DEPTH;

interface FlatPosition {
  readonly id: EventPosition["id"];
  readonly parentPositionId: EventPosition["parentPositionId"];
}

export type PositionSubtree<TPosition> = TPosition & {
  childPositions: PositionSubtree<TPosition>[];
};

const buildNodesById = <TPosition extends FlatPosition>(
  positions: TPosition[],
) => {
  const nodesById = new Map<string, PositionSubtree<TPosition>>(
    positions.map((position) => [
      position.id,
      { ...position, childPositions: [] },
    ]),
  );

  for (const node of nodesById.values()) {
    if (!node.parentPositionId) continue;
    nodesById.get(node.parentPositionId)?.childPositions.push(node);
  }

  return nodesById;
};

/**
 * Turns a flat list of positions into the nested structure the lineup is
 * rendered and stored as. Child positions keep the order of the given list.
 */
export const buildPositionTree = <TPosition extends FlatPosition>(
  positions: TPosition[],
): PositionSubtree<TPosition>[] => {
  const nodesById = buildNodesById(positions);

  return positions
    .filter((position) => !position.parentPositionId)
    .map((position) => nodesById.get(position.id))
    .filter((node) => node !== undefined);
};

/**
 * @returns The given position including all of its descendants or `null` if
 * the position isn't part of the given list.
 */
export const getPositionSubtree = <TPosition extends FlatPosition>(
  positions: TPosition[],
  positionId: EventPosition["id"],
): PositionSubtree<TPosition> | null =>
  buildNodesById(positions).get(positionId) ?? null;

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
