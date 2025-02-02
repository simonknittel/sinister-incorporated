import { getManufacturerById } from "@/fleet/queries";
import { notFound } from "next/navigation";

type Params = Promise<
  Readonly<{
    manufacturerId: string;
  }>
>;

type Props = Readonly<{
  params: Params;
}>;

export default async function Page(props: Props) {
  const manufacturer = await getManufacturerById(
    (await props.params).manufacturerId,
  );
  if (!manufacturer) notFound();

  return (
    <>
      <h1 className="font-bold">{manufacturer.name}</h1>
    </>
  );
}
