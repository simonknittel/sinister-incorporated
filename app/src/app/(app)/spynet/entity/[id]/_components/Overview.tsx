import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import { FaDiscord } from "react-icons/fa";
import { RiTimeLine } from "react-icons/ri";
import { prisma } from "~/server/db";
import DiscordIds from "./DiscordIds";
import Handles from "./Handles";

interface Props {
  entity: Entity & {
    logs: (EntityLog & {
      attributes: (EntityLogAttribute & { createdBy: User })[];
      submittedBy: User;
    })[];
  };
}

const Overview = async ({ entity }: Props) => {
  const spectrumId = entity.logs.find(
    (log) => log.type === "spectrum-id"
  )?.content;

  const latestConfirmedHandle = entity.logs.filter(
    (log) =>
      log.type === "handle" &&
      log.attributes.find(
        (attribute) =>
          attribute.key === "confirmed" && attribute.value === "true"
      )
  )?.[0];

  const latestConfirmedDiscordId = entity.logs.filter(
    (log) =>
      log.type === "discordId" &&
      log.attributes.find(
        (attribute) =>
          attribute.key === "confirmed" && attribute.value === "true"
      )
  )?.[0].content;

  let account;
  if (latestConfirmedDiscordId) {
    account = await prisma.account.findFirst({
      where: {
        provider: "discord",
        providerAccountId: latestConfirmedDiscordId,
      },
      include: {
        user: true,
      },
    });
  }

  return (
    <section className="rounded p-4 lg:p-8 bg-neutral-900">
      <h2 className="font-bold">Übersicht</h2>

      <dl className="mt-4">
        <dt className="text-neutral-500">Sinister ID</dt>
        <dd>{entity.id}</dd>

        <dt className="text-neutral-500 mt-4">Spectrum ID</dt>
        <dd>{spectrumId}</dd>

        <dt className="text-neutral-500 mt-4">Handle</dt>
        <dd className="flex gap-4 items-center">
          {latestConfirmedHandle?.content || (
            <span className="italic">Unbekannt</span>
          )}

          <Handles entity={entity} />
        </dd>

        <dt className="text-neutral-500 mt-4 flex gap-2 items-center">
          <FaDiscord />
          Discord ID
        </dt>
        <dd className="flex gap-4 items-center">
          {latestConfirmedDiscordId || (
            <span className="italic">Unbekannt</span>
          )}

          <DiscordIds entity={entity} />
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
