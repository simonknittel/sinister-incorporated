import { type Metadata } from "next";
import { z } from "zod";
import { env } from "~/env.mjs";
import Event from "./_components/Event";

export const metadata: Metadata = {
  title: "Events | Sinister Incorporated",
};

const scheduledEventsResponseSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().optional(),
    scheduled_start_time: z.coerce.date(),
    scheduled_end_time: z.coerce.date(),
    user_count: z.number(),
  })
);

async function getEvents() {
  if (env.NODE_ENV === "development") {
    const body = [
      {
        id: "1104301095754403840",
        name: "Test",
        image: "60ed0923dd2ea782f9f7f23be7f3f8a7",
        scheduled_start_time: "2023-05-21T08:00:00+00:00",
        scheduled_end_time: "2023-05-21T09:00:00+00:00",
        user_count: 1,
      },
    ];

    const events = await scheduledEventsResponseSchema.parseAsync(body);

    return events;
  } else {
    const headers = new Headers();
    headers.set("Authorization", `Bot ${env.DISCORD_TOKEN}`);

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/scheduled-events?with_user_count=true`,
      {
        headers,
        next: {
          revalidate: 60,
        },
      }
    );

    const body: unknown = await response.json();
    const events = await scheduledEventsResponseSchema.parseAsync(body);

    return events;
  }
}

export default async function Page() {
  const events = await getEvents();

  return (
    <main>
      <h1 className="font-bold text-xl">Events</h1>

      {events.map((event) => (
        <Event key={event.id} event={event} className="mt-4 max-w-4xl" />
      ))}
    </main>
  );
}
