"use client";

import { EditableText } from "@/common/components/EditableText";
import { type Ship } from "@prisma/client";
import { updateShip } from "../actions/ship";

type Props = Readonly<{
  className?: string;
  shipId: Ship["id"];
  name: string;
}>;

export const EditableShipName = ({ className, shipId, name }: Props) => {
  const action = (formData: FormData) => {
    const _formData = new FormData();
    _formData.set("id", shipId);
    _formData.set("name", formData.get("value")?.toString() || "");

    return updateShip(_formData);
  };

  return (
    <EditableText className={className} action={action} initialValue={name} />
  );
};
