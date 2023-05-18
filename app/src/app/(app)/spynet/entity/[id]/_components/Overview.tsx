import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
} from "@prisma/client";
import { type User } from "next-auth";
import { FaDiscord } from "react-icons/fa";
import { authenticateAndAuthorize } from "~/app/_utils/authenticateAndAuthorize";
import DiscordIds from "./DiscordIds";
import Handles from "./Handles";

interface Props {
  entity: Entity & {
    logs: (EntityLog & {
      attributes: (EntityLogAttribute & { createdBy: User })[];
    })[];
  };
}

const Overview = async ({ entity }: Props) => {
  const sortedHandles = entity.logs
    .filter((log) => log.type === "handle")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const spectrumId = entity.logs.find(
    (log) => log.type === "spectrum-id"
  )?.content;

  const discordId = entity.logs.find(
    (log) => log.type === "discord-id"
  )?.content;

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
          {sortedHandles[0]?.content || (
            <span className="italic">Unbekannt</span>
          )}

          {(await authenticateAndAuthorize("add-handle")) && (
            <Handles entity={entity} />
          )}
        </dd>

        <dt className="text-neutral-500 mt-4 flex gap-2 items-center">
          <FaDiscord />
          Discord ID
        </dt>
        <dd className="flex gap-4 items-center">
          {discordId || <span className="italic">Unbekannt</span>}

          {(await authenticateAndAuthorize("add-discord-id")) && (
            <DiscordIds entity={entity} />
          )}
        </dd>
      </dl>
    </section>
  );
};

export default Overview;
