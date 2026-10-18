import type { EventPosition } from "@sam-monorepo/database/client";
import {
  LINEUP_MAX_DEPTH,
  LINEUP_MAX_POSITIONS,
  LINEUP_MAX_POSITIONS_PER_LEVEL,
  type EventContainerColumns,
} from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";
import { ConflictError, NotFoundError, ValidationError } from "../errors.js";
import { LineupErrorMessage } from "./lineupErrors.js";
import { getPositionLevels } from "./lineupTree.js";
import {
  toStoredFontSize,
  type NewPositionFields,
  type PositionChange,
} from "./positionFields.js";

/*
 * The writes of the positions that the lineup of an event and the lineup of
 * an event template share. They carry no permission check: the use cases of
 * the event lineup check the event first, the app checks the template first
 * (the rules of the templates are in the app). No MCP tool calls them.
 */

/** The container of a position: an event or an event template */
export type LineupContainerColumns = EventContainerColumns;

/** @throws NotFoundError when the position does not exist */
export const findLineupPositionContainer = async (
  context: ApplicationContext,
  positionId: string,
): Promise<LineupContainerColumns> => {
  const position = await context.prisma.eventPosition.findUnique({
    where: { id: positionId },
    select: { eventId: true, templateId: true },
  });

  if (position?.eventId) return { eventId: position.eventId, templateId: null };
  if (position?.templateId)
    return { eventId: null, templateId: position.templateId };

  throw new NotFoundError(LineupErrorMessage.PositionNotFound);
};

/**
 * The database permits each variant one time for each position, thus the
 * repeated variants are removed. A variant that does not exist is an error
 * of the input.
 */
const requireVariants = async (
  context: ApplicationContext,
  variantIds: readonly string[],
) => {
  const uniqueVariantIds = Array.from(new Set(variantIds));
  if (uniqueVariantIds.length === 0) return uniqueVariantIds;

  const variantCount = await context.prisma.variant.count({
    where: { id: { in: uniqueVariantIds } },
  });
  if (variantCount !== uniqueVariantIds.length)
    throw new ValidationError(LineupErrorMessage.VariantNotFound);

  return uniqueVariantIds;
};

const toRequiredVariantRows = (variantIds: readonly string[]) =>
  variantIds.map((variantId, index) => ({ variantId, order: index }));

interface ContainerPosition {
  readonly id: string;
  readonly parentPositionId: string | null;
}

/**
 * The parent must be in the same container, or the position would go into a
 * different lineup: the tree uses only `parentPositionId`. A missing parent
 * is usually a parent that a different tab deleted. A parent on the last
 * level cannot get children.
 */
const requireParentPosition = (
  containerPositions: readonly ContainerPosition[],
  parentPositionId: string,
) => {
  const parentLevel =
    getPositionLevels(containerPositions).get(parentPositionId);
  if (parentLevel === undefined)
    throw new NotFoundError(LineupErrorMessage.PositionNotFound);

  if (parentLevel >= LINEUP_MAX_DEPTH)
    throw new ValidationError(LineupErrorMessage.LineupTooDeep);
};

/**
 * The limits of a new order (see `lineupOrderSchema`) also apply to a new
 * position, else the lineup could not get a new order anymore
 */
const requireRoomForPosition = (
  containerPositions: readonly ContainerPosition[],
  parentPositionId: string | null,
) => {
  if (containerPositions.length >= LINEUP_MAX_POSITIONS)
    throw new ConflictError(LineupErrorMessage.TooManyPositions);

  const siblingCount = containerPositions.filter(
    (position) => position.parentPositionId === parentPositionId,
  ).length;
  if (siblingCount >= LINEUP_MAX_POSITIONS_PER_LEVEL)
    throw new ConflictError(LineupErrorMessage.TooManyPositionsOnLevel);
};

/** The data of the audit event of a new position, without its container */
export interface CreatedLineupPosition {
  readonly positionId: string;
  readonly name: string;
  readonly variantIds: string[];
  readonly parentPositionId?: string;
}

/** Adds the position as the last position of its parent */
export const insertLineupPosition = async (
  context: ApplicationContext,
  container: LineupContainerColumns,
  fields: NewPositionFields,
): Promise<CreatedLineupPosition> => {
  const containerPositions = await context.prisma.eventPosition.findMany({
    where: container,
    select: { id: true, parentPositionId: true },
  });
  const parentPositionId = fields.parent_position_id ?? null;
  if (parentPositionId !== null)
    requireParentPosition(containerPositions, parentPositionId);
  requireRoomForPosition(containerPositions, parentPositionId);

  const variantIds = await requireVariants(
    context,
    fields.required_variant_ids,
  );

  const createdPosition = await context.prisma.eventPosition.create({
    data: {
      ...container,
      name: fields.name,
      description: fields.description,
      fontSize: toStoredFontSize(fields.font_size),
      backgroundColor: fields.background_color,
      textColor: fields.text_color,
      /**
       * The number of positions in the container is at least as large as
       * the order of each sibling
       */
      order: containerPositions.length,
      requiredVariants: {
        createMany: { data: toRequiredVariantRows(variantIds) },
      },
      parentPositionId,
    },
    select: { id: true },
  });

  return {
    positionId: createdPosition.id,
    name: fields.name,
    variantIds,
    parentPositionId: fields.parent_position_id,
  };
};

/** The data of the audit event of a changed position, without its container */
export interface UpdatedLineupPosition {
  readonly positionId: string;
  readonly previousName: string;
  readonly newName: string;
  readonly previousFontSize: string | null;
  readonly newFontSize: string | null;
  readonly previousBackgroundColor: string | null;
  readonly newBackgroundColor: string | null;
  readonly previousTextColor: string | null;
  readonly newTextColor: string | null;
}

/** A field of the change that is not given keeps the current value */
const changedValue = <Value>(change: Value | undefined, current: Value) =>
  change === undefined ? current : change;

export const updateLineupPosition = async (
  context: ApplicationContext,
  position: Pick<
    EventPosition,
    "id" | "name" | "fontSize" | "backgroundColor" | "textColor"
  >,
  change: PositionChange,
): Promise<UpdatedLineupPosition> => {
  const fields = {
    name: change.name,
    description: change.description,
    fontSize: toStoredFontSize(change.font_size),
    backgroundColor: change.background_color,
    textColor: change.text_color,
  };

  if (change.required_variant_ids) {
    const variantIds = await requireVariants(
      context,
      change.required_variant_ids,
    );

    await context.prisma.$transaction([
      context.prisma.eventPositionRequiredVariant.deleteMany({
        where: { positionId: position.id },
      }),
      context.prisma.eventPosition.update({
        where: { id: position.id },
        data: {
          ...fields,
          requiredVariants: {
            createMany: { data: toRequiredVariantRows(variantIds) },
          },
        },
      }),
    ]);
  } else {
    await context.prisma.eventPosition.update({
      where: { id: position.id },
      data: fields,
    });
  }

  return {
    positionId: position.id,
    previousName: position.name,
    newName: changedValue(change.name, position.name),
    previousFontSize: position.fontSize || null,
    newFontSize: changedValue(fields.fontSize, position.fontSize) || null,
    previousBackgroundColor: position.backgroundColor || null,
    newBackgroundColor:
      changedValue(change.background_color, position.backgroundColor) || null,
    previousTextColor: position.textColor || null,
    newTextColor: changedValue(change.text_color, position.textColor) || null,
  };
};

/** Deletes the position. Its children go with it (a cascade of the database). */
export const deleteLineupPosition = async (
  context: ApplicationContext,
  positionId: string,
) => {
  await context.prisma.eventPosition.delete({ where: { id: positionId } });
};
