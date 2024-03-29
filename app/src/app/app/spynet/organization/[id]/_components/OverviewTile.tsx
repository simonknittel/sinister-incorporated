import clsx from "clsx";
import { requireAuthentication } from "../../../../../../lib/auth/authenticateAndAuthorize";
import { prisma } from "../../../../../../server/db";

type Props = Readonly<{
  className?: string;
  id: string;
}>;

export const OverviewTile = async ({ className, id }: Props) => {
  const authentication = await requireAuthentication();
  if (
    !authentication.authorize([
      {
        resource: "organization",
        operation: "read",
      },
    ])
  )
    throw new Error("Unauthorized");

  const organization = await prisma.organization.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      spectrumId: true,
    },
  });
  if (!organization) throw new Error("Organization not found");

  return (
    <section
      className={clsx(className, "rounded-2xl p-4 lg:p-8 bg-neutral-800/50")}
    >
      <h2 className="font-bold">Übersicht</h2>

      <dl className="mt-4">
        <dt className="text-neutral-500">Sinister ID</dt>
        <dd>{organization.id}</dd>

        <dt className="text-neutral-500 mt-4">Spectrum ID</dt>
        <dd>
          {organization.spectrumId || <span className="italic">Unbekannt</span>}
        </dd>

        {/* <OverviewSection type="name" name="Name" organization={organization} /> */}
      </dl>
    </section>
  );
};
