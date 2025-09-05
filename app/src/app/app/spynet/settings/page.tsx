import { requireAuthenticationPage } from "@/auth/server";
import { SidebarLayout } from "@/common/components/layouts/sidebar/Layout";
import { log } from "@/logging";
import ClassificationLevelsTile from "@/spynet/components/classification-level/ClassificationLevelsTile";
import { Navigation } from "@/spynet/components/Navigation/Navigation";
import NoteTypesTile from "@/spynet/components/note-type/NoteTypesTile";
import { type Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Einstellungen - Spynet | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage(
    "/app/spynet/settings",
  );
  const [showNoteTypes, showClassificationLevels] = await Promise.all([
    authentication.authorize("noteType", "manage"),
    authentication.authorize("classificationLevel", "manage"),
  ]);

  if (!showNoteTypes && !showClassificationLevels) {
    void log.info("Forbidden request to page", {
      userId: authentication.session.user.id,
      reason: "Insufficient permissions",
    });

    redirect("/");
  }

  return (
    <SidebarLayout
      title="Spynet"
      sidebar={<Navigation />}
      childrenContainerClassName="flex flex-col gap-2"
    >
      {showNoteTypes && <NoteTypesTile />}
      {showClassificationLevels && <ClassificationLevelsTile />}
    </SidebarLayout>
  );
}
