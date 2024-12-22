import { cachedGetManufacturerById } from "@/fleet/utils/getManufacturerById";
import { notFound } from "next/navigation";

type Params = Readonly<{
  manufacturerId: string;
}>;

type Props = Readonly<{
  params: Params;
}>;

export default async function Page({ params }: Props) {
  const manufacturer = await cachedGetManufacturerById(params.manufacturerId);
  if (!manufacturer) notFound();

  return (
    <>
      <h1 className="font-bold">{manufacturer.name}</h1>
    </>
  );
}
