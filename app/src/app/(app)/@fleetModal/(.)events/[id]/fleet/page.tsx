import { groupBy } from "lodash";
import { type Metadata } from "next";
import dynamic from "next/dynamic";
import { z } from "zod";
import FleetTable from "~/app/(app)/fleet/_components/FleetTable";
import Modal from "~/app/_components/Modal";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

const TimeAgoContainer = dynamic(
  () => import("../../../../_components/TimeAgoContainer"),
  {
    ssr: false,
    loading: () => (
      <span className="block h-[1em] w-[7em] animate-pulse rounded bg-neutral-500" />
    ),
  }
);

const scheduledEventResponseSchema = z.union([
  z.object({
    id: z.string(),
    name: z.string(),
    user_count: z.number(),
  }),

  z.object({
    message: z.string(),
  }),
]);

const scheduledEventUsersResponseSchema = z.union([
  z.array(
    z.object({
      user: z.object({
        id: z.string(),
      }),
    })
  ),

  z.object({
    message: z.string(),
  }),
]);

async function getEvent(id: string) {
  if (env.NODE_ENV === "development") {
    const body = {
      id: "1104301095754403840",
      name: "Test",
      user_count: 1,
    };

    const data = await scheduledEventResponseSchema.parseAsync(body);

    if ("message" in data) throw new Error(data.message);

    return { date: new Date(), data };
  } else {
    const headers = new Headers();
    headers.set("Authorization", `Bot ${env.DISCORD_TOKEN}`);

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/scheduled-events/${id}?with_user_count=true`,
      {
        headers,
        next: {
          revalidate: 30,
        },
      }
    );

    const body: unknown = await response.json();
    const data = await scheduledEventResponseSchema.parseAsync(body);

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

async function getEventUsers(id: string) {
  if (env.NODE_ENV === "development") {
    const body = [
      {
        user: {
          id: "117890449187930113",
        },
      },
    ];

    const data = await scheduledEventUsersResponseSchema.parseAsync(body);

    if ("message" in data) throw new Error(data.message);

    return data;
  } else {
    const headers = new Headers();
    headers.set("Authorization", `Bot ${env.DISCORD_TOKEN}`);

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/scheduled-events/${id}/users`,
      {
        headers,
        next: {
          revalidate: 30,
        },
      }
    );

    const body: unknown = await response.json();
    const data = await scheduledEventUsersResponseSchema.parseAsync(body);

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

    return data;
  }
}

interface Params {
  id: string;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  try {
    const { data: event } = await getEvent(params.id);

    return {
      title: `Verfügbare Flotte - ${event.name} | Sinister Incorporated`,
    };
  } catch (error) {
    console.error(error);

    return {
      title: `Error | Sinister Incorporated`,
    };
  }
}

interface Props {
  params: Params;
}

export default async function Page({ params }: Props) {
  const { date, data: event } = await getEvent(params.id);
  const users = await getEventUsers(params.id);

  const userIds = users.map((user) => user.user.id);

  const orgShips = await prisma.ship.findMany({
    where: {
      owner: {
        accounts: {
          some: {
            providerAccountId: {
              in: userIds,
            },
          },
        },
      },
    },
    include: {
      variant: {
        include: {
          series: {
            include: {
              manufacturer: true,
            },
          },
        },
      },
    },
  });

  const groupedOrgShips = groupBy(orgShips, (ship) => ship.variant.id);
  const countedOrgShips = Object.values(groupedOrgShips).map((ships) => {
    const ship = ships[0]!;

    return {
      ...ship,
      count: ships.length,
    };
  });

  return (
    <Modal className="!absolute inset-4 lg:inset-32" isOpen={true}>
      <section>
        <h2 className="font-bold text-xl">Verfügbare Flotte</h2>

        <p className="mt-2">Teilnehmer: {event.user_count}</p>

        {countedOrgShips.length > 0 ? (
          <div className="rounded bg-neutral-900 p-4 lg:p-8 mt-4 overflow-auto">
            <FleetTable ships={countedOrgShips} />
          </div>
        ) : (
          <div className="bg-neutral-900 rounded p-4 lg:p-8 max-w-4xl mt-4">
            <p>Keine Teilnehmer oder Teilnehmer ohne Schiffe.</p>
          </div>
        )}

        {date && (
          <p className="text-neutral-500 mt-4 flex items-center gap-2">
            Letzte Aktualisierung:
            <TimeAgoContainer date={date} />
          </p>
        )}
      </section>
    </Modal>
  );
}
