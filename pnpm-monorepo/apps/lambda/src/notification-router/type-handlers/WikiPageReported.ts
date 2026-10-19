import {
  findWikiPageReportedRecipients,
  type ApplicationContext,
} from "@sam-monorepo/application";
import { type WikiPageReport } from "@sam-monorepo/database";
import { publishNotifications } from "../publish";

interface Payload {
  reportId: WikiPageReport["id"];
}

export const WikiPageReportedHandler = async (
  context: ApplicationContext,
  payload: Payload,
) => {
  const result = await findWikiPageReportedRecipients(context, {
    reportId: payload.reportId,
  });
  if (!result) return;

  const { report } = result;

  await publishNotifications(
    context,
    result.recipients.map((recipient) => ({
      receiverId: recipient.citizenId,
      notificationType: "wiki_page_reported" as const,
      payload: {
        reportId: report.id,
        pageTitle: report.pageTitle,
        uploadFileName: report.uploadFileName,
        // The app shows this value in the on-site text, thus it holds the
        // label of a deleted citizen.
        reportedByHandle: report.reportedByName,
      },
      title: "Neue Meldung im Wiki",
      body: report.uploadFileName
        ? `${report.reportedByName ?? "Unbekannt"} hat den Dateianhang "${report.uploadFileName}" auf der Seite "${report.pageTitle}" gemeldet`
        : `${report.reportedByName ?? "Unbekannt"} hat die Seite "${report.pageTitle}" gemeldet`,
      url: "/app/wiki/reports",
    })),
  );
};
