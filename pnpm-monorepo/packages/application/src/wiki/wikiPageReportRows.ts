import type { Prisma } from "@sam-monorepo/database/client";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { WIKI_CITIZEN_SELECT } from "./wikiCitizen.js";

const WIKI_PAGE_REPORT_SELECT = {
  id: true,
  message: true,
  uploadId: true,
  uploadFileName: true,
  createdAt: true,
  createdBy: { select: WIKI_CITIZEN_SELECT },
  resolvedAt: true,
  resolvedBy: { select: WIKI_CITIZEN_SELECT },
  resolutionComment: true,
  page: {
    select: {
      id: true,
      title: true,
      slug: true,
      iconId: true,
      deletedAt: true,
      eventId: true,
      templateId: true,
    },
  },
} as const satisfies Prisma.WikiPageReportSelect;

/** A report in the table of the reports and on the page of a report */
export type WikiPageReportRow = Prisma.WikiPageReportGetPayload<{
  select: typeof WIKI_PAGE_REPORT_SELECT;
}>;

/**
 * All reports, the newest first, for the table of the reports. The table
 * filters them in memory, and there is no limit (a known defect).
 *
 * @throws ForbiddenError without `wiki;manage`
 */
export const findWikiPageReportRows = (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
): Promise<WikiPageReportRow[]> => {
  requirePermission(actor, "wiki", "manage");

  return context.prisma.wikiPageReport.findMany({
    orderBy: { createdAt: "desc" },
    select: WIKI_PAGE_REPORT_SELECT,
  });
};

/**
 * The report, or null when it does not exist
 *
 * @throws ForbiddenError without `wiki;manage`
 */
export const findWikiPageReport = (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
  { reportId }: { readonly reportId: string },
): Promise<WikiPageReportRow | null> => {
  requirePermission(actor, "wiki", "manage");

  return context.prisma.wikiPageReport.findUnique({
    where: { id: reportId },
    select: WIKI_PAGE_REPORT_SELECT,
  });
};

/**
 * The number of the reports that are not resolved, for the badge of the
 * wiki tile and the navigation entry of the reports. 0 without
 * `wiki;manage`.
 */
export const countOpenWikiReports = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
): Promise<number> => {
  if (!actor.authorize("wiki", "manage")) return 0;

  return context.prisma.wikiPageReport.count({ where: { resolvedAt: null } });
};
