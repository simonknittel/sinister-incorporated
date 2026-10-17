import * as z from "zod";
import { idSchema } from "../pagination.js";

/** The text size of the name of a position in the lineup */
export enum PositionFontSize {
  /** The value of the form of the app for the normal size */
  Normal = "",
  Large = "large",
}

/**
 * The lineup form adds the required ship variants one at a time, thus a real
 * position has far fewer. The limit stops requests that are too large.
 */
const MAXIMUM_REQUIRED_VARIANTS = 250;

/** The lengths of the inputs of the lineup form */
const MAXIMUM_POSITION_NAME_LENGTH = 256;
const MAXIMUM_POSITION_DESCRIPTION_LENGTH = 512;

/**
 * The color input of the app sends `#rrggbb`. The lineup puts the value into
 * the inline style of the position, thus a different value could add CSS
 * declarations.
 */
const positionColorSchema = z.string().regex(/^#[0-9a-f]{6}$/i);

const positionNameSchema = z
  .string()
  .trim()
  .max(MAXIMUM_POSITION_NAME_LENGTH)
  .describe("The name of the position, for example a role on a ship.");

const positionDescriptionSchema = z
  .string()
  .trim()
  .max(MAXIMUM_POSITION_DESCRIPTION_LENGTH);

const requiredVariantIdsSchema = z
  .array(idSchema)
  .max(MAXIMUM_REQUIRED_VARIANTS)
  .describe(
    "The ship variants (from search_ship_variants) of which the citizen of the position flies one, in the order of preference.",
  );

/** Null resets a format; a field that is not given keeps its value */
const positionFormatSchemas = {
  font_size: z
    .enum(PositionFontSize)
    .nullish()
    .describe(
      'The text size of the name: "large", or the normal size ("" or null).',
    ),
  background_color: positionColorSchema
    .nullish()
    .describe("A color as #rrggbb, or null for the default color."),
  text_color: positionColorSchema
    .nullish()
    .describe("A color as #rrggbb, or null for the default color."),
};

/**
 * The fields of a new position. The use case of the event lineup adds the
 * event, the template lineup of the app adds its template.
 */
export const newPositionFieldsSchema = z.object({
  parent_position_id: idSchema
    .optional()
    .describe(
      "A position of the same lineup (from get_event_lineup) that gets the new position as its last child. Without it, the new position is on the top level.",
    ),
  name: positionNameSchema,
  description: positionDescriptionSchema.optional(),
  required_variant_ids: requiredVariantIdsSchema.default([]),
  ...positionFormatSchemas,
});

export type NewPositionFields = z.infer<typeof newPositionFieldsSchema>;

/** The fields of a position that an update changes. A missing field stays. */
export const positionChangeSchema = z.object({
  name: positionNameSchema.optional(),
  description: positionDescriptionSchema.optional(),
  required_variant_ids: requiredVariantIdsSchema
    .optional()
    .describe(
      "Replaces the required ship variants (from search_ship_variants), in the order of preference. An empty array removes them.",
    ),
  ...positionFormatSchemas,
});

export type PositionChange = z.infer<typeof positionChangeSchema>;
