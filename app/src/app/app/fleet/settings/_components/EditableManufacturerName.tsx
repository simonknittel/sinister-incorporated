"use client";

import { type Manufacturer } from "@prisma/client";
import { updateManufacturer } from "../../../../../lib/serverActions/manufacturer";
import { EditableText } from "../../../../_components/EditableText";

type Props = Readonly<{
  className?: string;
  manufacturer: Pick<Manufacturer, "id" | "name">;
}>;

export const EditableManufacturerName = ({
  className,
  manufacturer,
}: Props) => {
  const action = (newValue: string) => {
    return updateManufacturer({
      id: manufacturer.id,
      name: newValue,
    });
  };

  return (
    <EditableText
      className={className}
      action={action}
      initialValue={manufacturer.name}
    />
  );
};
