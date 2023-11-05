import { type Entity } from "@prisma/client";
import { FaDiscord, FaTeamspeak } from "react-icons/fa";
import { RiTimeLine } from "react-icons/ri";
import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import { getLastSeenAt } from "~/app/_lib/getLastSeenAt";
import { OverviewSection } from "./generic-log-type/OverviewSection";

interface Props {
  entity: Entity;
}

const Overview = async ({ entity }: Readonly<Props>) => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const lastSeenAt = await getLastSeenAt(entity);

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
        <dd>
          {entity.spectrumId || <span className="italic">Unbekannt</span>}
        </dd>

        <OverviewSection type="citizen-id" name="Citizen ID" entity={entity} />

        <OverviewSection type="handle" name="Handle" entity={entity} />

        <OverviewSection
          type="community-moniker"
          name="Community Moniker"
          entity={entity}
        />

        {authentication.authorize([
          {
            resource: "discord-id",
            operation: "read",
          },
        ]) && (
          <OverviewSection
            type="discord-id"
            icon={<FaDiscord />}
            name="Discord ID"
            entity={entity}
          />
        )}

        {authentication.authorize([
          {
            resource: "teamspeak-id",
            operation: "read",
          },
        ]) && (
          <OverviewSection
            type="teamspeak-id"
            icon={<FaTeamspeak />}
            name="TeamSpeak ID"
            entity={entity}
          />
        )}

        {lastSeenAt && (
          <>
            <dt className="text-neutral-500 mt-4 flex gap-2 items-center">
              <RiTimeLine />
              Zuletzt gesehen
            </dt>
            <dd className="flex gap-4 items-center">
              {lastSeenAt.toLocaleDateString("de-DE", {
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
