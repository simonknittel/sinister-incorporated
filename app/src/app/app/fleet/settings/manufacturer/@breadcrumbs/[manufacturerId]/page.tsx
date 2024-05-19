import { notFound } from "next/navigation";
import { cachedGetManufacturerById } from "../../../_lib/getManufacturerById";

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
