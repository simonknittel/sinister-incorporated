import * as z from "zod";
import { idSchema } from "../pagination.js";
import {
  EVENT_DESCRIPTION_MAX_LENGTH,
  EVENT_MAX_VISIBILITY_ROLES,
  EVENT_NAME_MAX_LENGTH,
  EVENT_PARTICIPATION_TEXT_MAX_LENGTH,
} from "./eventConstraints.js";
import { EventVisibilityType } from "./eventOutput.js";

export const eventNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(EVENT_NAME_MAX_LENGTH);

export const eventDescriptionSchema = z
  .string()
  .trim()
  .max(EVENT_DESCRIPTION_MAX_LENGTH)
  .nullable()
  .describe("Plain text. Null or an empty text means no description.");

export const eventDateTimeSchema = z.iso
  .datetime({ offset: true })
  .describe(
    "ISO 8601 with a time zone offset, for example 2026-10-24T20:00:00+02:00.",
  );

export const eventVisibilitySchema = z
  .enum(EventVisibilityType)
  .describe(
    "public: every user who can read events sees it. restricted: only the holders of visibility_role_ids, the creator, the managers and the event managers of the organization see it.",
  );

export const visibilityRoleIdsSchema = z
  .array(idSchema)
  .max(EVENT_MAX_VISIBILITY_ROLES)
  .describe(
    "The role ids (from list_roles) that see a restricted event. A restricted event needs at least one. A public event ignores them.",
  );

export const participationTextSchema = z
  .string()
  .trim()
  .max(EVENT_PARTICIPATION_TEXT_MAX_LENGTH);
