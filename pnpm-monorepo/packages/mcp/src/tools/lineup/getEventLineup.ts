import {
  getEventLineup,
  getEventLineupInputSchema,
} from "@sam-monorepo/application";
import * as z from "zod";
import { citizenReferenceSchema, eventReferenceSchema } from "../../schemas.js";
import {
  defineTool,
  READ_ONLY_TOOL_ANNOTATIONS,
} from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";

const positionFields = {
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  required_variants: z.array(
    z.strictObject({
      id: z.string(),
      name: z.string(),
    }),
  ),
  /** Null when nobody is assigned or the assigned citizen is deleted */
  assignee: citizenReferenceSchema.nullable(),
  applications: z.array(citizenReferenceSchema),
};

const createPositionSchema = <Children extends z.ZodType>(children: Children) =>
  z.strictObject({ ...positionFields, children: z.array(children) });

/**
 * The lineup has at most four levels (see the position tree of the use
 * case), thus the positions of the fourth level have no children. The
 * schema names the levels instead of a recursive reference.
 */
const fourthLevelPositionSchema = z.strictObject({
  ...positionFields,
  children: z.array(z.unknown()).max(0),
});

const positionSchema = createPositionSchema(
  createPositionSchema(createPositionSchema(fourthLevelPositionSchema)),
);

export const getEventLineupTool = defineTool({
  name: "get_event_lineup",
  group: ToolGroup.Lineup,
  title: "Get the lineup of an event",
  description:
    "Gives the lineup of an event by its event id (from list_events): the tree of positions (up to four levels) with the required ship variants, the assigned citizen and the citizens who applied (only when can_manage_positions is true, else empty). Only for events whose lineup is enabled, or whose positions the user can manage. A deleted citizen shows as null or is left out.",
  annotations: READ_ONLY_TOOL_ANNOTATIONS,
  inputSchema: getEventLineupInputSchema,
  outputSchema: z.strictObject({
    event: eventReferenceSchema,
    can_manage_positions: z.boolean(),
    /** False after the end of the event: then the lineup cannot change */
    is_updatable: z.boolean(),
    positions: z.array(positionSchema),
  }),
  isVisible: (actor) =>
    actor.authorize("event", "read") &&
    actor.authorize("ship", "read") &&
    actor.citizen !== null,
  handler: (context, actor, input) => getEventLineup(context, actor, input),
});
