import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { Link } from "@/common/components/Link";
import Note from "@/common/components/Note";
import type { Entity, EventPosition, Ship } from "@prisma/client";
import clsx from "clsx";

type Props = Readonly<{
  className?: string;
  positions: (EventPosition & {
    citizen: Entity | null;
  })[];
  allEventCitizens: { citizen: Entity; ships: Ship[] }[];
}>;

export const Unassigned = ({
  className,
  positions,
  allEventCitizens,
}: Props) => {
  const authentication = useAuthentication();
  if (!authentication) throw new Error("Unauthorized");

  const unassignedCitizen = allEventCitizens
    .filter((citizen) => {
      return !positions.some(
        (position) => position.citizen?.id === citizen.citizen.id,
      );
    })
    .toSorted((a, b) =>
      (a.citizen.handle || a.citizen.id).localeCompare(
        b.citizen.handle || b.citizen.id,
      ),
    );

  if (unassignedCitizen.length <= 0) return null;

  return (
    <Note
      type="info"
      message={
        <div className="flex flex-col">
          <p className="font-bold">Keinem Posten zugeordnet</p>

          <ul className="mt-2 flex gap-x-3 gap-y-1 flex-wrap">
            {unassignedCitizen.map((citizen) => (
              <li key={citizen.citizen.id}>
                <Link
                  href={`/app/spynet/citizen/${citizen.citizen.id}`}
                  className={clsx("hover:underline self-start", {
                    "text-green-500":
                      citizen.citizen.id === authentication.session.entityId,
                    "text-sinister-red-500":
                      citizen.citizen.id !== authentication.session.entityId,
                  })}
                  prefetch={false}
                >
                  {citizen.citizen.handle || citizen.citizen.id}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      }
      className={clsx("!max-w-none", className)}
    />
  );
};
