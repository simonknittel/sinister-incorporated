import Link from "next/link";
import { notFound } from "next/navigation";
import { dedupedGetSeriesAndManufacturerById } from "../../../../../_lib/getSeriesAndManufacturer";

type Params = Readonly<{
  manufacturerId: string;
  seriesId: string;
}>;

type Props = Readonly<{
  params: Params;
}>;

export default async function Page({ params }: Props) {
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
