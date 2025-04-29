import { requireAuthentication } from "@/auth/server";
import Avatar from "@/common/components/Avatar";
import { Link } from "@/common/components/Link";
import { SingleRole } from "@/common/components/SingleRole";
import { getPenaltyEntriesOfCurrentUser } from "@/penalty-points/queries";
import { getMyAssignedRoles } from "@/roles/utils/getRoles";
import { getSilcBalanceOfCurrentCitizen } from "@/silc/queries";
import clsx from "clsx";
import { forbidden } from "next/navigation";
import { FaExternalLinkAlt, FaPiggyBank } from "react-icons/fa";
import { FaScaleBalanced } from "react-icons/fa6";

interface Props {
  readonly className?: string;
}

export const ProfileTile = async ({ className }: Props) => {
  const authentication = await requireAuthentication();
  if (!authentication.session.entity) forbidden();

  const name =
    authentication.session.user.name || authentication.session.discordId;
  const image = authentication.session.user.image;
  const roles = await getMyAssignedRoles();

  const [showSpynetLink, showPenaltyPoints, showSilcBalance] =
    await Promise.all([
      authentication.authorize("citizen", "read"),
      authentication.authorize("ownPenaltyEntry", "read"),
      authentication.authorize("silcBalanceOfCurrentCitizen", "read"),
    ]);

  const silcBalance = showSilcBalance
    ? await getSilcBalanceOfCurrentCitizen()
    : undefined;
  const penaltyPoints = showPenaltyPoints
    ? (await getPenaltyEntriesOfCurrentUser()).reduce(
        (previous, current) => (previous += current.points),
        0,
      )
    : undefined;

  return (
    <div className="flex flex-col gap-2 items-center">
      <section
        className={clsx(
          className,
          "rounded-2xl p-4 lg:p-8 bg-neutral-800/50 flex flex-col gap-4 items-center",
        )}
      >
        <Avatar name={name} image={image} size={128} />

        <h2 className="font-thin">{name}</h2>

        {roles.length > 0 && (
          <div className="flex gap-2 flex-wrap justify-center">
            {roles.map((role) => (
              <SingleRole key={role.id} role={role} />
            ))}
          </div>
        )}
      </section>

      {(showSilcBalance || showPenaltyPoints) && (
        <div className="flex gap-2 w-full">
          {showSilcBalance && (
            <Link
              href={`/app/spynet/citizen/${authentication.session.entity.id}/silc`}
              title="Übersicht öffnen"
              className="flex-1 rounded-2xl bg-neutral-800/50 hover:bg-neutral-600/50 focus-visible:bg-neutral-600/50 flex flex-col justify-center items-center p-4"
            >
              <span
                className={clsx("font-black text-4xl", {
                  "text-green-500": silcBalance && silcBalance > 0,
                  "text-red-500": silcBalance && silcBalance < 0,
                })}
              >
                {silcBalance}
              </span>
              <p className="text-neutral-500 flex gap-2 items-center">
                <FaPiggyBank className="text-neutral-500" />
                SILC
              </p>
            </Link>
          )}

          {showPenaltyPoints && (
            <Link
              href={`/app/spynet/citizen/${authentication.session.entity.id}/penalty-points`}
              title="Übersicht öffnen"
              className="flex-1 rounded-2xl bg-neutral-800/50 hover:bg-neutral-600/50 focus-visible:bg-neutral-600/50 flex flex-col justify-center items-center p-4"
            >
              <span
                className={clsx("font-black text-4xl", {
                  "text-red-500": penaltyPoints && penaltyPoints > 0,
                })}
              >
                {penaltyPoints}
              </span>
              <p className="text-neutral-500 flex gap-2 items-center">
                <FaScaleBalanced className="text-neutral-500" />
                Strafpunkte
              </p>
            </Link>
          )}
        </div>
      )}

      {showSpynetLink && (
        <Link
          href={`/app/spynet/citizen/${authentication.session.entity.id}`}
          className="text-sinister-red-500 hover:text-sinister-red-300 flex gap-2 items-center"
        >
          Vollständiges Profil
          <FaExternalLinkAlt />
        </Link>
      )}
    </div>
  );
};
