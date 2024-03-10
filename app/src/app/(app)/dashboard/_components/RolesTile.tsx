import { type Entity } from "@prisma/client";
import clsx from "clsx";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
import { authenticate } from "~/_lib/auth/authenticateAndAuthorize";
import { getAssignedAndVisibleRoles } from "~/app/_lib/getAssignedAndVisibleRoles";
import { prisma } from "~/server/db";
import SingleRole from "./SingleRole";

type Props = Readonly<{
  className?: string;
  entity?: Entity;
}>;

export const RolesTile = async ({ className }: Props) => {
  const authentication = await authenticate();

  const entity = await prisma.entity.findUnique({
    where: {
      discordId: authentication.session.discordId,
    },
  });

  if (!entity)
    return (
      <section
        className={clsx(
          className,
          "rounded-2xl p-4 lg:p-8 bg-neutral-800/50 backdrop-blur",
        )}
      >
        <h2 className="font-bold mb-4">Meine Rollen und Zertifikate</h2>

        <p className="text-neutral-500 italic">Keine</p>
      </section>
    );

  const roles = await getAssignedAndVisibleRoles(entity);

  return (
    <section
      className={clsx(
        className,
        "rounded-2xl p-4 lg:p-8 bg-neutral-800/50 backdrop-blur",
      )}
      style={{ gridArea: "roles" }}
    >
      <h2 className="font-bold mb-4">Meine Rollen und Zertifikate</h2>

      {roles.length > 0 ? (
        <div className="flex gap-2 flex-wrap">
          {roles.map((role) => (
            <SingleRole key={role.id} role={role} />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 italic">Keine</p>
      )}

      <Link
        href={`/spynet/entity/${entity.id}`}
        prefetch={false}
        className="text-sinister-red-500 hover:text-sinister-red-300 flex gap-2 items-center mt-4"
      >
        Zu meinem Spynet-Eintrag
        <FaExternalLinkAlt />
      </Link>
    </section>
  );
};
