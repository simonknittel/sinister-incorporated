"use client";

import { EditableText } from "@/common/components/form/EditableText";
import { type Manufacturer } from "@prisma/client";
import { updateManufacturerAction } from "../actions/updateManufacturer";

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

    return updateManufacturerAction(_formData);
  };

  return (
    <EditableText
      className={className}
      action={action}
      initialValue={manufacturer.name}
    />
  );
};
