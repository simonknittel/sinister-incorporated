import { notFound } from "next/navigation";
import { getManufacturer } from "../../_lib/getManufacturer";

type Params = Readonly<{
  manufacturerId: string;
}>;

type Props = Readonly<{
  params: Params;
}>;

export default async function Page({ params }: Props) {
  const manufacturer = await getManufacturer(params.manufacturerId);

  if (!manufacturer) notFound();

  return (
    <>
      <h1 className="font-bold">{manufacturer.name}</h1>
    </>
  );
}
