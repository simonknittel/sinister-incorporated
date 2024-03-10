import clsx from "clsx";
import { type Metadata } from "next";
import { authenticatePage } from "~/_lib/auth/authenticateAndAuthorize";
import { CalendarTile } from "./_components/CalendarTile";
import { QuotesTile } from "./_components/QuotesTile";
import { RolesTile } from "./_components/RolesTile";
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
        <RolesTile />
        {/* <ShipsTile /> */}
      </div>

      <QuotesTile className="mt-4" />
    </main>
  );
}
