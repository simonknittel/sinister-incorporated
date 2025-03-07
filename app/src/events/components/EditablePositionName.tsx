"use client";

import { EditableTextV2 } from "@/common/components/form/EditableTextV2";
import { type EventPosition } from "@prisma/client";
import { updateEventPositionName } from "../actions/updateEventPositionName";

type Props = Readonly<{
  className?: string;
  positionId: EventPosition["id"];
  name: string;
}>;

export const EditablePositionName = ({
  className,
  positionId,
  name,
}: Props) => {
  const action = (formData: FormData) => {
    const _formData = new FormData();
    _formData.set("id", positionId);
    _formData.set("name", formData.get("value")?.toString() || "");

    return updateEventPositionName(_formData);
  };

  return (
    <EditableTextV2 className={className} action={action} initialValue={name} />
  );
};
