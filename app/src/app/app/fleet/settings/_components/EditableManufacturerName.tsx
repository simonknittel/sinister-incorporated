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
  const action = (formData: FormData) => {
    const _formData = new FormData();
    _formData.set("id", manufacturer.id);
    _formData.set("name", formData.get("value")?.toString() || "");

    return updateManufacturer(_formData);
  };

  return (
    <EditableText
      className={className}
      action={action}
      initialValue={manufacturer.name}
    />
  );
};
