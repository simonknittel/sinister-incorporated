import { type Metadata } from "next";
import dynamic from "next/dynamic";
import { z } from "zod";
import { authenticatePage } from "~/app/_lib/auth/authenticateAndAuthorize";
import { env } from "~/env.mjs";
import Event from "./_components/Event";

const TimeAgoContainer = dynamic(
  () => import("../_components/TimeAgoContainer"),
  {
    ssr: false,
    loading: () => (
      <span className="block h-[1em] w-[7em] animate-pulse rounded bg-neutral-500" />
    ),
  }
);

export const metadata: Metadata = {
  title: "Events | Sinister Incorporated",
};

const scheduledEventsResponseSchema = z.union([
  z.array(
    z.object({
      id: z.string(),
      guild_id: z.string(),
      name: z.string(),
      image: z.string().optional().nullable(),
      scheduled_start_time: z.coerce.date(),
      scheduled_end_time: z.coerce.date(),
      user_count: z.number(),
    })
  ),
  z.object({
    message: z.string(),
  }),
]);

async function getEvents() {
  if (env.NODE_ENV === "development") {
    const body = [
      {
        id: "1104301095754403840",
        guild_id: "460775097314050048",
        name: "Test 1",
        image: "60ed0923dd2ea782f9f7f23be7f3f8a7",
        scheduled_start_time: "2023-05-21T08:00:00+00:00",
        scheduled_end_time: "2023-05-21T09:00:00+00:00",
        user_count: 1,
      },
      {
        id: "1104301095754403841",
        guild_id: "460775097314050048",
        name: "Test 2",
        image: "60ed0923dd2ea782f9f7f23be7f3f8a7",
        scheduled_start_time: "2023-05-25T08:00:00+00:00",
        scheduled_end_time: "2023-05-25T09:00:00+00:00",
        user_count: 1,
      },
    ];

    const data = await scheduledEventsResponseSchema.parseAsync(body);

    if ("message" in data) throw new Error(data.message);

    return { date: new Date(), data };
  } else {
    const headers = new Headers();
    headers.set("Authorization", `Bot ${env.DISCORD_TOKEN}`);

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/scheduled-events?with_user_count=true`,
      {
        headers,
        next: {
          revalidate: 30,
        },
      }
    );

    const body: unknown = await response.json();
    const data = await scheduledEventsResponseSchema.parseAsync(body);

    if ("message" in data) {
      if (data.message === "You are being rate limited.") {
        throw new Error("Rate Limiting der Discord API");
      } else if (data.message === "Unknown Guild") {
        throw new Error(
          `Der Discord Server \"${env.DISCORD_GUILD_ID}\" existiert nicht.`
        );
      } else if (data.message === "Missing Access") {
        throw new Error(
          `Diese Anwendung hat keinen Zugriff auf den Discord Server \"${env.DISCORD_GUILD_ID}\".`
        );
      } else {
        throw new Error(data.message);
      }
    }

    return { date: response.headers.get("Date"), data };
  }
}

export default async function Page() {
  const authentication = await authenticatePage();
  authentication.authorizePage([
    {
      resource: "event",
      operation: "read",
    },
  ]);

  const { date, data: events } = await getEvents();

  return (
    <main className="p-4 lg:p-8 pt-20">
      <h1 className="font-bold text-xl">Events</h1>

      {events
        .sort(
          (a, b) =>
            a.scheduled_start_time.getTime() - b.scheduled_start_time.getTime()
        )
        .map((event) => (
          <Event key={event.id} event={event} className="mt-4 max-w-4xl" />
        ))}

      {events.length === 0 && (
        <div className="bg-neutral-900 rounded p-4 lg:p-8 max-w-4xl mt-4">
          <p>Aktuell sind keine Events geplant.</p>
        </div>
      )}

      {date && (
        <p className="text-neutral-500 mt-4 flex items-center gap-2">
          Letzte Aktualisierung:
          <TimeAgoContainer date={date} />
        </p>
      )}
    </main>
  );
}
