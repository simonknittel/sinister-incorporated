/** The use cases of the penalty points */
export {
  PenaltyEntryErrorMessage,
  createPenaltyEntry,
  createPenaltyEntryInputSchema,
  type CreatePenaltyEntryOutput,
} from "./createPenaltyEntry.js";
export {
  PenaltyEntryStatus,
  listPenaltyEntries,
  listPenaltyEntriesInputSchema,
  type ListPenaltyEntriesOutput,
} from "./listPenaltyEntries.js";
export type {
  PenaltyEntryCitizenOutput,
  PenaltyEntryOutput,
} from "./penaltyEntryOutput.js";
