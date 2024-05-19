"use client";

import { type Manufacturer } from "@prisma/client";
import { EditableText } from "../../../../../_components/EditableText";

type Props = Readonly<{
  className?: string;
  manufacturer: Pick<Manufacturer, "id" | "name">;
}>;

export const EditableManufacturerName = ({
  className,
  manufacturer,
}: Props) => {
  const action = (newValue: string) => {
    return fetch(`/api/manufacturer/${manufacturer.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: newValue,
      }),
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
