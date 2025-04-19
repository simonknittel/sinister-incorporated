"use client";

import { EditableText } from "@/common/components/form/EditableText";
import { type Manufacturer } from "@prisma/client";
import { updateManufacturerAction } from "../actions/updateManufacturer";

interface Props {
  readonly className?: string;
  readonly manufacturer: Pick<Manufacturer, "id" | "name">;
}

export const EditableManufacturerName = ({
  className,
  manufacturer,
}: Props) => {
  const action = (formData: FormData) => {
    const _formData = new FormData();
    _formData.set("id", manufacturer.id);
    _formData.set("name", (formData.get("value") as string) || "");

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
