import {
  EventTemplateSharing,
  EventTemplateStatus,
} from "@sam-monorepo/application";
import { parseAsString, parseAsStringEnum } from "nuqs/server";

export const EVENT_TEMPLATE_STATUS_PARAM = "status";
export const EVENT_TEMPLATE_SHARING_PARAM = "sharing";
export const EVENT_TEMPLATE_OWNER_PARAM = "owner";
export const EVENT_TEMPLATE_QUERY_PARAM = "q";

export const eventTemplateStatusParser = parseAsStringEnum(
  Object.values(EventTemplateStatus),
).withDefault(EventTemplateStatus.Active);

export const eventTemplateSharingParser = parseAsStringEnum(
  Object.values(EventTemplateSharing),
).withDefault(EventTemplateSharing.All);

export const eventTemplateFilterParsers = {
  [EVENT_TEMPLATE_STATUS_PARAM]: eventTemplateStatusParser,
  [EVENT_TEMPLATE_SHARING_PARAM]: eventTemplateSharingParser,
  [EVENT_TEMPLATE_OWNER_PARAM]: parseAsString,
  [EVENT_TEMPLATE_QUERY_PARAM]: parseAsString,
};
