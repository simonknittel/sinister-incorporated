import type { EventPosition } from "@sam-monorepo/database/client";
import type { ApplicationContext } from "../context.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { LineupErrorMessage } from "./lineupErrors.js";
import type { NewPositionFields, PositionChange } from "./positionFields.js";

/*
 * The writes of the positions that the lineup of an event and the lineup of
 * an event template share. They carry no permission check: the use cases of
 * the event lineup check the event first, the app checks the template first
 * (the rules of the templates are in the app). No MCP tool calls them.
 */

/**
 * The container of a position: an event or an event template. Exactly one of
 * the two columns is set (a CHECK constraint of the database).
 */
export type LineupContainerColumns =
  | { readonly eventId: string; readonly templateId: null }
  | { readonly eventId: null; readonly templateId: string };

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

/**
 * The parent must be in the same container, or the position would go into a
 * different lineup: the tree uses only `parentPositionId`. A missing parent
 * is usually a parent that a different tab deleted.
 */
const requireParentPosition = async (
  context: ApplicationContext,
  container: LineupContainerColumns,
  parentPositionId: string,
) => {
  const parentPosition = await context.prisma.eventPosition.findFirst({
    where: { id: parentPositionId, ...container },
    select: {
      parentPosition: {
        select: { parentPosition: { select: { parentPositionId: true } } },
      },
    },
  });
  if (!parentPosition)
    throw new NotFoundError(LineupErrorMessage.PositionNotFound);

  // The lineup shows four levels, thus a parent on the fourth level is full
  if (parentPosition.parentPosition?.parentPosition?.parentPositionId)
    throw new ValidationError(LineupErrorMessage.LineupTooDeep);
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
  if (fields.parent_position_id)
    await requireParentPosition(context, container, fields.parent_position_id);

  const variantIds = await requireVariants(
    context,
    fields.required_variant_ids,
  );

  /**
   * The order of a new position is the number of positions in the container,
   * which is at least as large as the order of each sibling
   */
  const positionCount = await context.prisma.eventPosition.count({
    where: container,
  });

  const createdPosition = await context.prisma.eventPosition.create({
    data: {
      ...container,
      name: fields.name,
      description: fields.description,
      fontSize: fields.font_size,
      backgroundColor: fields.background_color,
      textColor: fields.text_color,
      order: positionCount,
      requiredVariants: {
        createMany: { data: toRequiredVariantRows(variantIds) },
      },
      parentPositionId: fields.parent_position_id ?? null,
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
    fontSize: change.font_size,
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
    newFontSize: changedValue(change.font_size, position.fontSize) || null,
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
