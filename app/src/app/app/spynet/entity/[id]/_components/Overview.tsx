import { requireAuthentication } from "@/auth/server";
import { RSIButton } from "@/common/components/RSIButton";
import { type Entity } from "@prisma/client";
import clsx from "clsx";
import { Suspense } from "react";
import { FaDiscord, FaTeamspeak } from "react-icons/fa";
import { RiTimeLine } from "react-icons/ri";
import { LastSeenAt } from "../../../citizen/_components/LastSeenAt";
import { OverviewSection } from "./generic-log-type/OverviewSection";

type Props = Readonly<{
  className?: string;
  entity: Entity;
}>;

export const Overview = async ({ className, entity }: Props) => {
  const authentication = await requireAuthentication();

  return (
    <section
      className={clsx(className, "rounded-2xl p-4 lg:p-8 bg-neutral-800/50")}
    >
      <h2 className="font-bold">Übersicht</h2>

      <dl className="mt-4">
        <dt className="text-neutral-500">Sinister ID</dt>
        <dd>{entity.id}</dd>

        <dt className="text-neutral-500 mt-4">Spectrum ID</dt>
        <dd>{entity.spectrumId || <span className="italic">-</span>}</dd>

        <OverviewSection type="citizen-id" name="Citizen ID" entity={entity} />

        <OverviewSection type="handle" name="Handle" entity={entity} />

        <OverviewSection
          type="community-moniker"
          name="Community Moniker"
          entity={entity}
        />

        {authentication.authorize("discord-id", "read") && (
          <OverviewSection
            type="discord-id"
            icon={<FaDiscord />}
            name="Discord ID"
            entity={entity}
          />
        )}

        {authentication.authorize("teamspeak-id", "read") && (
          <OverviewSection
            type="teamspeak-id"
            icon={<FaTeamspeak />}
            name="TeamSpeak ID"
            entity={entity}
          />
        )}

        {authentication.authorize("lastSeen", "read") && (
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

      {entity.handle && (
        <RSIButton
          className="mt-4"
          href={`https://robertsspaceindustries.com/citizens/${entity.handle}`}
        />
      )}
    </section>
  );
};
