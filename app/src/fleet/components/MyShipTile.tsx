import {
  type Manufacturer,
  type Series,
  type Ship,
  type Upload,
  type Variant,
} from "@prisma/client";
import clsx from "clsx";
import { DeleteShip } from "./DeleteShip";
import { EditableShipName } from "./EditableShipName";
import { VariantWithLogo } from "./VariantWithLogo";

interface Props {
  readonly className?: string;
  readonly ship: Ship & {
    variant: Variant & {
      series: Series & {
        manufacturer: Manufacturer & {
          image: Upload | null;
        };
      };
    };
  };
}

export const MyShipTile = ({ className, ship }: Props) => {
  return (
    <article className={clsx(className, "bg-neutral-800/50 rounded-2xl")}>
      <div className="flex justify-between items-center">
        <h3 className="font-bold p-4">
          <EditableShipName
            key={ship.id} // I don't know why this is necessary. However, it fixes the issue of the name not updating when creating/deleting two ships in a row.
            shipId={ship.id}
            name={ship.name || ship.variant.name}
            className="[&_button]:text-left"
          />
        </h3>

        <div className="pr-2">
          <DeleteShip ship={ship} />
        </div>
      </div>

      <div className="px-4 pb-4">
        <VariantWithLogo
          variant={ship.variant}
          manufacturer={ship.variant.series.manufacturer}
        />
      </div>
    </article>
  );
};
