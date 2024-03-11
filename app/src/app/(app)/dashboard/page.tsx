import clsx from "clsx";
import { type Metadata } from "next";
import { authenticatePage } from "~/_lib/auth/authenticateAndAuthorize";
import { CalendarTile } from "./_components/CalendarTile";
import { ProfileTile } from "./_components/ProfileTile";
import { QuotesTile } from "./_components/QuotesTile";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Dashboard | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage();

  const showEventsTile = authentication.authorize([
    {
      resource: "event",
      operation: "read",
    },
  ]);

  return (
    <main className="p-2 lg:p-8 pt-20">
      <h1 className="sr-only">Dashboard</h1>

      <div className={clsx(styles.tileGrid)}>
        {showEventsTile && <CalendarTile />}
        <ProfileTile />
        {/* <ShipsTile /> */}
      </div>

      <QuotesTile className="mt-4" />
    </main>
  );
}
