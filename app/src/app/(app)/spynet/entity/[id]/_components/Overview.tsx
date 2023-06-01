import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import { FaDiscord } from "react-icons/fa";
import { RiTimeLine } from "react-icons/ri";
import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import getLatestConfirmedCitizenAttributes from "~/app/_lib/getLatestConfirmedCitizenAttributes";
import { prisma } from "~/server/db";
import DiscordIds from "./discord-id/DiscordIds";
import Handles from "./handle/Handles";
import TeamspeakIds from "./teamspeak-id/TeamspeakIds";

interface Props {
  entity: Entity & {
    logs: (EntityLog & {
      attributes: (EntityLogAttribute & { createdBy: User })[];
      submittedBy: User;
    })[];
  };
}

const Overview = async ({ entity }: Props) => {
  const authentication = await authenticate();

  const { handle, spectrumId, discordId, teamspeakId } =
    getLatestConfirmedCitizenAttributes(entity);

  let account;
  if (
    authentication &&
    authentication.authorize([
      {
        resource: "lastSeen",
        operation: "read",
      },
    ]) &&
    discordId
  ) {
    account = await prisma.account.findFirst({
      where: {
        provider: "discord",
        providerAccountId: discordId,
      },
      include: {
        user: true,
      },
    });
  }

  return (
    <section
      className="rounded p-4 lg:p-8 bg-neutral-900"
      style={{
        gridArea: "overview",
      }}
    >
      <h2 className="font-bold">Übersicht</h2>

      <dl className="mt-4">
        <dt className="text-neutral-500">Sinister ID</dt>
        <dd>{entity.id}</dd>

        <dt className="text-neutral-500 mt-4">Spectrum ID</dt>
        <dd>{spectrumId}</dd>

        <dt className="text-neutral-500 mt-4">Handle</dt>
        <dd className="flex gap-4 items-center">
          {handle || <span className="italic">Unbekannt</span>}

          <Handles entity={entity} />
        </dd>

        <dt className="text-neutral-500 mt-4 flex gap-2 items-center">
          <FaDiscord />
          Discord ID
        </dt>
        <dd className="flex gap-4 items-center">
          {discordId || <span className="italic">Unbekannt</span>}

          <DiscordIds entity={entity} />
        </dd>

        <dt className="text-neutral-500 mt-4">TeamSpeak ID</dt>
        <dd className="flex gap-4 items-center">
          {teamspeakId || <span className="italic">Unbekannt</span>}

          <TeamspeakIds entity={entity} />
        </dd>

        {account?.user.lastSeenAt && (
          <>
            <dt className="text-neutral-500 mt-4 flex gap-2 items-center">
              <RiTimeLine />
              Zuletzt gesehen
            </dt>
            <dd className="flex gap-4 items-center">
              {account.user.lastSeenAt.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </dd>
          </>
        )}
      </dl>
    </section>
  );
};

export default Overview;
