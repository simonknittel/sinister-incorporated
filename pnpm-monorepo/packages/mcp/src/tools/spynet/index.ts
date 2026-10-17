import type { CatalogTool } from "../../toolDefinition.js";
import { getCitizenTool } from "./getCitizen.js";
import { getOrganizationTool } from "./getOrganization.js";
import { listCitizenNotesTool } from "./listCitizenNotes.js";
import { listCitizensTool } from "./listCitizens.js";
import { searchCitizensAndOrganizationsTool } from "./searchCitizensAndOrganizations.js";

export const spynetTools: readonly CatalogTool[] = [
  searchCitizensAndOrganizationsTool,
  listCitizensTool,
  getCitizenTool,
  listCitizenNotesTool,
  getOrganizationTool,
];
