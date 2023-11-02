import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import { FaDiscord, FaTeamspeak } from "react-icons/fa";
import { RiTimeLine } from "react-icons/ri";
import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import { getLatestConfirmedCitizenAttributes } from "~/app/_lib/getLatestConfirmedCitizenAttributes";
import { OverviewSection } from "./generic-log-type/OverviewSection";
import Handles from "./handle/Handles";

interface Props {
  entity: Entity & {
    logs: (EntityLog & {
      attributes: (EntityLogAttribute & { createdBy: User })[];
      submittedBy: User;
    })[];
  };
}

const Overview = async ({ entity }: Readonly<Props>) => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const { handle, spectrumId, lastSeenAt } =
    await getLatestConfirmedCitizenAttributes(entity);

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

        {authentication.authorize([
          {
            resource: "citizenId",
            operation: "read",
          },
        ]) && (
          <OverviewSection
            type="citizen-id"
            permissionResource="citizenId"
            name="Citizen ID"
            entity={entity}
          />
        )}

        <dt className="text-neutral-500 mt-4">Handle</dt>
        <dd className="flex gap-4 items-center">
          {handle || <span className="italic">Unbekannt</span>}

          <Handles entity={entity} />
        </dd>

        {authentication.authorize([
          {
            resource: "communityMoniker",
            operation: "read",
          },
        ]) && (
          <OverviewSection
            type="communityMoniker"
            permissionResource="communityMoniker"
            name="Community Moniker"
            entity={entity}
          />
        )}

        {authentication.authorize([
          {
            resource: "discordId",
            operation: "read",
          },
        ]) && (
          <OverviewSection
            type="discordId"
            permissionResource="discordId"
            icon={<FaDiscord />}
            name="Discord ID"
            entity={entity}
          />
        )}

        {authentication.authorize([
          {
            resource: "teamspeakId",
            operation: "read",
          },
        ]) && (
          <OverviewSection
            type="teamspeakId"
            permissionResource="teamspeakId"
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
