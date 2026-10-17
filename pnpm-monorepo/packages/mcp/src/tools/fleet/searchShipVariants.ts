import {
  canSearchShipVariants,
  searchShipVariants,
  searchShipVariantsInputSchema,
} from "@sam-monorepo/application";
import * as z from "zod";
import {
  defineTool,
  READ_ONLY_TOOL_ANNOTATIONS,
} from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";
import { shipVariantOutputSchema } from "./shipVariantOutputSchema.js";

export const searchShipVariantsTool = defineTool({
  name: "search_ship_variants",
  group: ToolGroup.Fleet,
  title: "Search ship variants",
  description:
    "Searches the ship catalog for variants whose name, series name or manufacturer name contains the query, sorted by the variant name. Use it to get the variant ids and the manufacturer ids that other tools need.",
  annotations: READ_ONLY_TOOL_ANNOTATIONS,
  inputSchema: searchShipVariantsInputSchema,
  outputSchema: z.strictObject({
    variants: z.array(shipVariantOutputSchema),
  }),
  isVisible: canSearchShipVariants,
  handler: searchShipVariants,
});
