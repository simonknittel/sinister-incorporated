"use client";

import { EditableText } from "@/common/components/EditableText";
import { type Manufacturer } from "@prisma/client";
import { updateManufacturer } from "../actions/manufacturer";

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
