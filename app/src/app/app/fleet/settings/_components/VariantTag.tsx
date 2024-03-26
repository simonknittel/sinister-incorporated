import { type Variant } from "@prisma/client";
import DeleteVariantButton from "./DeleteVariantButton";

interface Props {
  data: Variant;
}

const VariantTag = ({ data }: Readonly<Props>) => {
  return (
    <li className="bg-neutral-800 rounded flex gap-2 items-center">
      <p className="py-2 pl-4 pr-2">{data.name}</p>

      <DeleteVariantButton variant={data} />
    </li>
  );
};

export default VariantTag;
