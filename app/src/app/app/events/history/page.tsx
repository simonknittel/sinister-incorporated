import { authenticatePage } from "@/auth/server";
import { Event } from "@/events/components/Event";
import { getPastEvents } from "@/events/queries";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Vergangene Events | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/events/history");
  await authentication.authorizePage("event", "read");

  const events = await getPastEvents();

  return (
    <main className="p-4 pb-20 lg:p-6 max-w-[1920px] mx-auto">
      <h1 className="text-xl font-bold">Vergangene Events</h1>

      <div className="flex flex-col gap-4 items-center 3xl:overflow-hidden mt-4 max-w-[400px] 3xl:max-w-none">
        {events.length > 0 ? (
          events.map((event, index) => (
            <Event key={event.id} event={event} index={index} />
          ))
        ) : (
          <div className="bg-neutral-800/50 rounded-primary p-4 lg:p-8 w-full">
            <p>Keine Events vorhanden.</p>
          </div>
        )}
      </div>
    </main>
  );
}
