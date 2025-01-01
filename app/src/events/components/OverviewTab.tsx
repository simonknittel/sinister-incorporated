import { requireAuthentication } from "@/auth/server";
import { SingleRole } from "@/common/components/SingleRole";
import { getAssignedAndVisibleRoles } from "@/common/utils/getAssignedAndVisibleRoles";
import type { getEvent } from "@/discord/getEvent";
import { VariantTagBadge } from "@/fleet/components/VariantTagBadge";
import type { Role, VariantTag } from "@prisma/client";
import clsx from "clsx";
import { getEventFleet } from "../utils/getEventFleet";
import { getParticipants } from "../utils/getParticipants";

type Props = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>["data"];
}>;

export const OverviewTab = async ({ className, event }: Props) => {
  const authentication = await requireAuthentication();
  const showFleetSummary = await authentication.authorize("orgFleet", "read");

  return (
    <div className={clsx("flex flex-col gap-4", className)}>
      {showFleetSummary && <FleetSummary event={event} />}

      <ParticipantsSummary event={event} />
    </div>
  );
};

type FleetSummaryProps = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>["data"];
}>;

const FleetSummary = async ({ className, event }: FleetSummaryProps) => {
  const eventFleet = await getEventFleet(event, true);

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
      <h2 className="font-bold mb-4">Flotte der Teilnehmer</h2>

      <div className="flex gap-2 flex-wrap">
        {Array.from(countedTags.values())
          .toSorted((a, b) => b.count - a.count)
          .map((countedTag) => (
            <div
              key={countedTag.tag.id}
              className="flex items-center rounded-l bg-neutral-700/50"
            >
              <span className="inline-block px-2 text-xl font-bold">
                {countedTag.count}
              </span>

              <VariantTagBadge tag={countedTag.tag} />
            </div>
          ))}
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

  const countedRoles = new Map<string, { role: Role; count: number }>();

  for (const citizen of spynetCitizen) {
    const roles = await getAssignedAndVisibleRoles(citizen.entity!);

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
      <h2 className="font-bold mb-4">Rollen/Zertifikate der Teilnehmer</h2>

      <div className="flex gap-2 flex-wrap">
        {Array.from(countedRoles.values())
          .toSorted((a, b) => b.count - a.count)
          .map((countedRole) => (
            <div
              key={countedRole.role.id}
              className="flex items-center rounded-l bg-neutral-700/50"
            >
              <span className="inline-block px-2 text-xl font-bold">
                {countedRole.count}
              </span>

              <SingleRole role={countedRole.role} />
            </div>
          ))}
      </div>
    </section>
  );
};
