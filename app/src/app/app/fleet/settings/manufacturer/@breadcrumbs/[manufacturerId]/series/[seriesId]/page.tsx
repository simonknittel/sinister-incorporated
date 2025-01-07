import { Link } from "@/common/components/Link";
import { dedupedGetSeriesAndManufacturerById } from "@/fleet/queries";
import { notFound } from "next/navigation";

type Params = Promise<
  Readonly<{
    manufacturerId: string;
    seriesId: string;
  }>
>;

type Props = Readonly<{
  params: Params;
}>;

export default async function Page(props: Props) {
  const params = await props.params;
  const [series, manufacturer] = await dedupedGetSeriesAndManufacturerById(
    params.seriesId,
    params.manufacturerId,
  );

  if (!series || !manufacturer) notFound();

  return (
    <>
      <Link
        href={`/app/fleet/settings/manufacturer/${manufacturer.id}`}
        className="text-sinister-red-500 hover:text-sinister-red-300 transition-colors"
      >
        {manufacturer.name}
      </Link>

      <span className="text-neutral-700">/</span>

      <h1 className="font-bold">{series.name}</h1>
    </>
  );
}
