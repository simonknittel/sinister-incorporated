"use client";

import { type Ship } from "@prisma/client";
import { EditableText } from "../../../_components/EditableText";

type Props = Readonly<{
  className?: string;
  shipId: Ship["id"];
  name: string;
}>;

export const EditableShipName = ({ className, shipId, name }: Props) => {
  const action = (newValue: string) => {
    return fetch(`/api/ship/${shipId}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: newValue,
      }),
    });
  };

  return (
    <EditableText className={className} action={action} initialValue={name} />
  );
};
