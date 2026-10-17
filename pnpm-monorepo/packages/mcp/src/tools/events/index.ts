import type { CatalogTool } from "../../toolDefinition.js";
import { addEventManagersTool } from "./addEventManagers.js";
import { addEventParticipantsTool } from "./addEventParticipants.js";
import { cancelEventParticipationTool } from "./cancelEventParticipation.js";
import { createEventTool } from "./createEvent.js";
import { deleteEventTool } from "./deleteEvent.js";
import { getEventTool } from "./getEvent.js";
import { listEventsTool } from "./listEvents.js";
import { removeEventManagerTool } from "./removeEventManager.js";
import { removeEventParticipantTool } from "./removeEventParticipant.js";
import { signUpForEventTool } from "./signUpForEvent.js";
import { updateEventTool } from "./updateEvent.js";

export const eventsTools: readonly CatalogTool[] = [
  addEventManagersTool,
  addEventParticipantsTool,
  cancelEventParticipationTool,
  createEventTool,
  deleteEventTool,
  getEventTool,
  listEventsTool,
  removeEventManagerTool,
  removeEventParticipantTool,
  signUpForEventTool,
  updateEventTool,
];
