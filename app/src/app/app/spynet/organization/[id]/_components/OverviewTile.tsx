import clsx from "clsx";
import Image from "next/image";
import { requireAuthentication } from "../../../../../../lib/auth/authenticateAndAuthorize";
import { prisma } from "../../../../../../server/db";
import { RSIButton } from "../../../../../_components/RSIButton";

type Props = Readonly<{
  className?: string;
  id: string;
}>;

export const OverviewTile = async ({ className, id }: Props) => {
  const authentication = await requireAuthentication();
  if (!authentication.authorize("organization", "read"))
    throw new Error("Unauthorized");

  const organization = await prisma.organization.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      spectrumId: true,
      name: true,
      logo: true,
    },
  });
  if (!organization) throw new Error("Organization not found");

  return (
    <section className={clsx(className, "rounded-2xl overflow-hidden")}>
      {organization.logo && (
        <div className="bg-black flex items-center justify-center p-2">
          <Image
            src={`https://robertsspaceindustries.com${organization.logo}`}
            alt=""
            width={128}
            height={128}
          />
        </div>
      )}

      <div className={clsx("p-4 lg:p-8 bg-neutral-800/50")}>
        <h2 className="font-bold">Übersicht</h2>

        <dl className="mt-4">
          <dt className="text-neutral-500">Name</dt>
          <dd>{organization.name}</dd>

          <dt className="text-neutral-500 mt-4">Spectrum ID</dt>
          <dd>{organization.spectrumId}</dd>

          <dt className="text-neutral-500 mt-4">Sinister ID</dt>
          <dd>{organization.id}</dd>
        </dl>

        <RSIButton
          className="mt-4"
          href={`https://robertsspaceindustries.com/orgs/${organization.spectrumId}`}
        />
      </div>
    </section>
  );
};
