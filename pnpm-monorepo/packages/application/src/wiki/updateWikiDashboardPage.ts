import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import {
  WIKI_SETTING_DASHBOARD_PAGE,
  requireLiveWikiPages,
  writeWikiSetting,
} from "./wikiSettings.js";

export const updateWikiDashboardPageInputSchema = z.object({
  /** Null removes the page from the dashboard */
  page_id: idSchema.nullable(),
});

export type UpdateWikiDashboardPageInput = z.infer<
  typeof updateWikiDashboardPageInputSchema
>;

export interface UpdateWikiDashboardPageOutput {
  readonly page_id: string | null;
}

/**
 * Sets the page that the dashboard of the app shows. The dashboard is global
 * curation, thus it needs `wiki;manage`: the managers of a page manage their
 * pages, not what the dashboard shows.
 *
 * @throws ForbiddenError without `wiki;manage`
 * @throws NotFoundError when the page is not a page of the global wiki or
 * is in the trash
 */
export const updateWikiDashboardPage = (
  context: ApplicationContext,
  actor: Actor,
  input: UpdateWikiDashboardPageInput,
): Promise<UpdateWikiDashboardPageOutput> =>
  withSpan(context, "updateWikiDashboardPage", async () => {
    requirePermission(actor, "wiki", "manage");
    if (input.page_id) await requireLiveWikiPages(context, [input.page_id]);

    await writeWikiSetting(context, actor, {
      key: WIKI_SETTING_DASHBOARD_PAGE,
      value: input.page_id,
    });

    return { page_id: input.page_id };
  });
