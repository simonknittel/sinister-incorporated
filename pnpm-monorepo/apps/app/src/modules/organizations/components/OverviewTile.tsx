import { RSIButton } from "@/modules/common/components/RSIButton";
import { getOrganizationById } from "@/modules/organizations/queries/getOrganizationById";
import clsx from "clsx";
import Image from "next/image";

interface Props {
  readonly className?: string;
  readonly id: string;
}

export const OverviewTile = async ({ className, id }: Props) => {
  const organization = await getOrganizationById(id);

  return (
    <section className={clsx(className, "overflow-hidden rounded-primary")}>
      {organization.logo_url && (
        <div className="flex items-center justify-center bg-black p-2">
          <Image src={organization.logo_url} alt="" width={128} height={128} />
        </div>
      )}

      <div className={clsx("bg-secondary p-4")}>
        <h2 className="font-bold">Übersicht</h2>

        <dl className="mt-4">
          <dt className="text-neutral-500">Name</dt>
          <dd>{organization.name}</dd>

          <dt className="mt-4 text-neutral-500">Spectrum ID</dt>
          <dd>{organization.spectrum_id}</dd>

          <dt className="mt-4 text-neutral-500">Internal ID</dt>
          <dd>{organization.id}</dd>
        </dl>

        <RSIButton
          className="mt-4"
          href={`https://robertsspaceindustries.com/orgs/${organization.spectrum_id}`}
        />
      </div>
    </section>
  );
};
