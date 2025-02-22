import { requireAuthentication } from "@/auth/server";
import type { getEvent } from "@/discord/utils/getEvent";
import { getAssignedRoles } from "@/roles/utils/getRoles";
import type { Role, Upload, VariantTag } from "@prisma/client";
import clsx from "clsx";
import { getEventFleet } from "../utils/getEventFleet";
import { getParticipants } from "../utils/getParticipants";
import { OverviewTile } from "./OverviewTile";
import { RolesTable } from "./RolesTable";
import { VariantTagsTable } from "./VariantTagsTable";

type Props = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>;
}>;

export const OverviewTab = async ({ className, event }: Props) => {
  const authentication = await requireAuthentication();
  const showFleetSummary = await authentication.authorize("orgFleet", "read");

  return (
    <div
      className={clsx(
        "flex flex-col items-center 2xl:flex-row 2xl:items-start gap-4",
        className,
      )}
    >
      <OverviewTile
        event={event.data}
        date={event.date}
        className="w-full max-w-[480px] flex-none"
      />

      <div className="flex-1 w-full flex-col md:flex-row lg:flex-col xl:flex-row 2xl:flex-col 3xl:flex-row flex gap-2">
        {showFleetSummary && (
          <FleetSummary
            event={event.data}
            className="flex-initial w-full md:w-1/2 lg:w-full xl:w-1/2 2xl:w-full 3xl:w-1/2"
          />
        )}

        <ParticipantsSummary
          event={event.data}
          className="flex-initial w-full md:w-1/2 lg:w-full xl:w-1/2 2xl:w-full 3xl:w-1/2"
        />
      </div>
    </div>
  );
};

type FleetSummaryProps = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>["data"];
}>;

const FleetSummary = async ({ className, event }: FleetSummaryProps) => {
  const eventFleet = await getEventFleet(event);

  const countedTags = new Map<string, { tag: VariantTag; count: number }>();

  for (const fleetVariant of eventFleet) {
    for (const tag of fleetVariant.variant.tags) {
      if (countedTags.has(tag.id)) {
        countedTags.set(tag.id, {
          tag,
          count: countedTags.get(tag.id)!.count + 1,
        });
      } else {
        countedTags.set(tag.id, {
          tag,
          count: 1,
        });
      }
    }
  }

  return (
    <section
      className={clsx("rounded-2xl bg-neutral-800/50 p-4 lg:p-8", className)}
    >
      <h2 className="font-bold">Flotte der Teilnehmer</h2>
      <p className="mb-4 text-neutral-500 text-sm">
        Summe aller Tags. Nur flight ready.
      </p>

      <div className="flex gap-2 flex-wrap overflow-x-auto">
        <VariantTagsTable rows={Array.from(countedTags.values())} />
      </div>
    </section>
  );
};

type ParticipantsSummaryProps = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>["data"];
}>;

const ParticipantsSummary = async ({
  className,
  event,
}: ParticipantsSummaryProps) => {
  const { spynetCitizen } = await getParticipants(event);

  const countedRoles = new Map<
    string,
    {
      role: Role & {
        icon: Upload | null;
      };
      count: number;
    }
  >();

  for (const citizen of spynetCitizen) {
    const roles = await getAssignedRoles(citizen.entity!);

    for (const role of roles) {
      if (countedRoles.has(role.id)) {
        countedRoles.set(role.id, {
          role,
          count: countedRoles.get(role.id)!.count + 1,
        });
      } else {
        countedRoles.set(role.id, {
          role,
          count: 1,
        });
      }
    }
  }

  return (
    <section
      className={clsx("rounded-2xl bg-neutral-800/50 p-4 lg:p-8", className)}
    >
      <h2 className="font-bold">Rollen/Zertifikate der Teilnehmer</h2>
      <p className="mb-4 text-neutral-500 text-sm">
        Summe aller Rollen/Zertifikate
      </p>

      <div className="flex gap-2 flex-wrap overflow-x-auto">
        <RolesTable rows={Array.from(countedRoles.values())} />
      </div>
    </section>
  );
};
