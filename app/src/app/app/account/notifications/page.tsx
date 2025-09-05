import { Navigation } from "@/account/components/Navigation/Navigation";
import { requireAuthenticationPage } from "@/auth/server";
import { SidebarLayout } from "@/common/components/layouts/sidebar/Layout";
import { Note } from "@/common/components/Note";
import { Tile } from "@/common/components/Tile";
import { EventsNotifications } from "@/events/components/EventsNotifications";
import { TasksNotifications } from "@/tasks/components/TasksNotifications";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Benachrichtigungen - Account | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await requireAuthenticationPage("/app/account/notifications");

  return (
    <SidebarLayout
      title="Account"
      sidebar={<Navigation />}
      childrenContainerClassName="flex flex-col gap-2"
    >
      <Tile heading="Events">
        <EventsNotifications />
      </Tile>

      <Tile heading="Tasks">
        <TasksNotifications />
      </Tile>

      <Note
        type="info"
        message={
          <div className="flex flex-col gap-2">
            <p>
              Unterstützt werden Google Chrome (Desktop und Android), Microsoft
              Edge (Desktop und Android) sowie Firefox (nur, wenn geöffnet).
              Safari wird nicht unterstützt.
            </p>

            <p>Diese Einstellungen werden pro Browser und Gerät gespeichert.</p>
          </div>
        }
      />
    </SidebarLayout>
  );
}
