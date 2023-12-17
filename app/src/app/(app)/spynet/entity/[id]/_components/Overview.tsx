import { type Entity } from "@prisma/client";
import { Suspense } from "react";
import { FaDiscord, FaTeamspeak } from "react-icons/fa";
import { RiTimeLine } from "react-icons/ri";
import { requireAuthentication } from "~/_lib/auth/authenticateAndAuthorize";
import { LastSeenAt } from "../../../citizen/_components/LastSeenAt";
import { OverviewSection } from "./generic-log-type/OverviewSection";

interface Props {
  entity: Entity;
}

const Overview = async ({ entity }: Readonly<Props>) => {
  const authentication = await requireAuthentication();

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

        {authentication.authorize([
          {
            resource: "lastSeen",
            operation: "read",
          },
        ]) && (
          <>
            <dt className="text-neutral-500 mt-4 flex gap-2 items-center">
              <RiTimeLine />
              Zuletzt gesehen
            </dt>
            <dd className="flex gap-4 items-center">
              <Suspense
                fallback={
                  <div className="bg-neutral-800 animate-pulse rounded h-6 w-20" />
                }
              >
                <LastSeenAt entity={entity} />
              </Suspense>
            </dd>
          </>
        )}
      </dl>
    </section>
  );
};

export default Overview;
