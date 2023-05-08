import { groupBy } from "lodash";
import { type Metadata } from "next";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";
import { z } from "zod";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import ShipTile from "../../../_components/ShipTile";

// const TimeAgoContainer = dynamic(() => import("../../_components/TimeAgo"), {
//   ssr: false,
// });

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

    return data;
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

    return data;
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
    const event = await getEvent(params.id);

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
  const event = await getEvent(params.id);
  const users = await getEventUsers(params.id);

  const userIds = users.map((user) => user.user.id);

  const ownerships = await prisma.fleetOwnership.findMany({
    where: {
      user: {
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

  const groupedOwnerships = groupBy(
    ownerships,
    (ownership) => ownership.variant.id
  );
  const ships = Object.values(groupedOwnerships).map((ownerships) => {
    const ownership = ownerships[0];

    return {
      ...ownership,
      count: ownerships.reduce((acc, curr) => acc + curr.count, 0),
    };
  });

  return (
    <main>
      <ul className="flex items-center gap-2">
        <li>
          <Link
            href="/events"
            className="flex items-center gap-1 hover:underline"
          >
            <FaChevronLeft className="text-xs" /> Events
          </Link>
        </li>

        <li className="text-neutral-500">/</li>

        <li className="underline">{event.name}</li>
      </ul>

      <h1 className="font-bold text-xl mt-8">Verfügbare Flotte</h1>

      <p className="mt-2">Teilnehmer: {event.user_count}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-4">
        {ships.map((ownership) => (
          <ShipTile
            key={ownership.variantId}
            ownership={ownership}
            nonInteractive={true}
          />
        ))}
      </div>

      {/* <p className="text-neutral-500 mt-4">
        Letzte Aktualisierung: <TimeAgoContainer date={new Date()} />
      </p> */}
    </main>
  );
}
