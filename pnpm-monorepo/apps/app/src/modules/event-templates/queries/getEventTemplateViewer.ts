import { getRequestActor } from "@/modules/application";
import { toEventTemplateViewer } from "@sam-monorepo/application";
import { cache } from "react";

/** The current viewer as the template permission resolver needs them */
export const getEventTemplateViewer = cache(async () =>
  toEventTemplateViewer(await getRequestActor()),
);
