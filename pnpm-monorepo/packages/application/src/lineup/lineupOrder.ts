import * as z from "zod";
import type { ApplicationContext } from "../context.js";
import { ConflictError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { LineupErrorMessage } from "./lineupErrors.js";
import type { LineupContainerColumns } from "./lineupWrites.js";

/**
 * The same limit as `MAX_POSITIONS_PER_LEVEL` of the app: the paste of a
 * position obeys it, thus a pasted position never makes the lineup too large
 * for a new order
 */
const MAXIMUM_POSITIONS_PER_LEVEL = 50;

/** One new order writes one row for each position in one transaction */
const MAXIMUM_ORDERED_POSITIONS = 500;

/** The largest value of the integer column of the database */
const MAXIMUM_ORDER_VALUE = 2_147_483_647;

/** A position of a new order of the lineup, with its children */
export interface LineupOrderNode {
  readonly id: string;
  readonly order?: number | undefined;
  readonly children?: readonly LineupOrderNode[] | undefined;
}

const orderNodeFields = {
  id: idSchema.describe("A position of the lineup (from get_event_lineup)."),
  order: z
    .int()
    .min(0)
    .max(MAXIMUM_ORDER_VALUE)
    .optional()
    .describe(
      "The sort key of the position among its siblings. Without it, the index in the array.",
    ),
};

const orderLevelSchema = <Node extends z.ZodType>(node: Node) =>
  z.array(node).max(MAXIMUM_POSITIONS_PER_LEVEL);

/**
 * The lineup has four levels, thus the positions of the fourth level have no
 * children. The schema names the levels instead of a recursive reference.
 */
const fourthLevelNodeSchema = z.object(orderNodeFields);

const createOrderNodeSchema = <Child extends z.ZodType>(child: Child) =>
  z.object({
    ...orderNodeFields,
    children: orderLevelSchema(child).optional(),
  });

const flattenOrder = (
  positions: readonly LineupOrderNode[],
): LineupOrderNode[] =>
  positions.flatMap((position) => [
    position,
    ...flattenOrder(position.children ?? []),
  ]);

/**
 * The positions of the lineup as a tree. The nesting sets the parents; the
 * positions that the tree does not name keep their place.
 */
export const lineupOrderSchema = orderLevelSchema(
  createOrderNodeSchema(
    createOrderNodeSchema(createOrderNodeSchema(fourthLevelNodeSchema)),
  ),
)
  .refine(
    (positions) => flattenOrder(positions).length <= MAXIMUM_ORDERED_POSITIONS,
    {
      message: `The order has more than ${MAXIMUM_ORDERED_POSITIONS} positions`,
    },
  )
  // A position under itself would leave the tree
  .refine(
    (positions) => {
      const positionIds = flattenOrder(positions).map(({ id }) => id);
      return new Set(positionIds).size === positionIds.length;
    },
    { message: "The order has a position more than one time" },
  )
  .describe(
    "The full lineup as a tree of at most four levels: the top-level positions in their new order, each with its children in their new order.",
  );

/**
 * Writes the order and the parents of the tree. Each position of the tree
 * must be in the container: the parents come from the tree, thus no parent
 * goes into a different lineup.
 *
 * @throws ConflictError when a position is not in the container, usually a
 * position that a different tab deleted
 */
export const writeLineupOrder = async (
  context: ApplicationContext,
  container: LineupContainerColumns,
  positions: readonly LineupOrderNode[],
) => {
  const containerPositions = await context.prisma.eventPosition.findMany({
    where: container,
    select: { id: true },
  });
  const containerPositionIds = new Set(
    containerPositions.map((position) => position.id),
  );
  if (
    flattenOrder(positions).some(
      (position) => !containerPositionIds.has(position.id),
    )
  )
    throw new ConflictError(LineupErrorMessage.LineupChanged);

  const toUpdates = (
    siblings: readonly LineupOrderNode[],
    parentPositionId: string | null,
  ): ReturnType<typeof context.prisma.eventPosition.update>[] =>
    siblings.flatMap((position, index) => [
      context.prisma.eventPosition.update({
        where: { id: position.id },
        data: {
          order: position.order ?? index,
          parentPositionId: { set: parentPositionId },
        },
      }),
      ...toUpdates(position.children ?? [], position.id),
    ]);

  await context.prisma.$transaction(toUpdates(positions, null));
};
