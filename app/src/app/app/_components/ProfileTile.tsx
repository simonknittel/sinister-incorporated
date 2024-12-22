import { authenticate } from "@/auth/server";
import Avatar from "@/common/components/Avatar";
import { getAssignedAndVisibleRoles } from "@/common/utils/getAssignedAndVisibleRoles";
import { prisma } from "@/db";
import { type Entity } from "@prisma/client";
import clsx from "clsx";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
import SingleRole from "./SingleRole";

type Props = Readonly<{
  className?: string;
  entity?: Entity;
}>;

export const ProfileTile = async ({ className }: Props) => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const name =
    authentication.session.user.name || authentication.session.discordId;

  const image = authentication ? authentication.session.user.image : undefined;

  const entity = await prisma.entity.findUnique({
    where: {
      discordId: authentication.session.discordId,
    },
  });

  const roles = entity ? await getAssignedAndVisibleRoles(entity) : [];

  const showLink =
    authentication.authorize("citizen", "read") ||
    authentication.authorize("organization", "read");

  return (
    <section
      className={clsx(
        className,
        "rounded-2xl p-4 lg:p-8 bg-neutral-800/50 flex flex-col gap-4 items-center",
      )}
    >
      <Avatar name={name} image={image} size={128} />

      <h2 className="font-bold">{name}</h2>

      {roles.length > 0 ? (
        <div className="flex gap-2 flex-wrap justify-center">
          {roles.map((role) => (
            <SingleRole key={role.id} role={role} />
          ))}
        </div>
      ) : null}

      {authentication.session.entityId && showLink && (
        <Link
          href={`/app/spynet/entity/${authentication.session.entityId}`}
          className="text-sinister-red-500 hover:text-sinister-red-300 flex gap-2 items-center"
        >
          Vollständiges Profil
          <FaExternalLinkAlt />
        </Link>
      )}
    </section>
  );
};
