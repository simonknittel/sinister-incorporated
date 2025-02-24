import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { Link } from "@/common/components/Link";
import type { Entity, EventPosition } from "@prisma/client";
import clsx from "clsx";

type Props = Readonly<{
  className?: string;
  positions: (EventPosition & {
    citizen: Entity | null;
  })[];
  allEventCitizen: Entity[];
}>;

export const Unassigned = ({
  className,
  positions,
  allEventCitizen,
}: Props) => {
  const authentication = useAuthentication();
  if (!authentication) throw new Error("Unauthorized");

  const unassignedCitizen = allEventCitizen
    .filter((citizen) => {
      return !positions.some((position) => position.citizen?.id === citizen.id);
    })
    .toSorted((a, b) => (a.handle || a.id).localeCompare(b.handle || b.id));

  return (
    <section className={clsx("rounded-2xl bg-neutral-800/50 p-4", className)}>
      <h3 className="font-bold">Keinem Posten zugeordnet</h3>

      {unassignedCitizen.length > 0 ? (
        <ul className="mt-2 flex gap-x-3 gap-y-1 flex-wrap">
          {unassignedCitizen.map((citizen) => (
            <li key={citizen.id}>
              <Link
                href={`/app/spynet/citizen/${citizen.id}`}
                className={clsx("hover:underline self-start", {
                  "text-green-500":
                    citizen.id === authentication.session.entityId,
                  "text-sinister-red-500":
                    citizen.id !== authentication.session.entityId,
                })}
                prefetch={false}
              >
                {citizen.handle || citizen.id}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-neutral-500">-</p>
      )}
    </section>
  );
};
