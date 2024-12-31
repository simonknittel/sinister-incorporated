"use client";

import { EditableText } from "@/common/components/EditableText";
import { type Series } from "@prisma/client";
import { updateSeries } from "../actions/updateSeries";

type Props = Readonly<{
  className?: string;
  series: Pick<Series, "id" | "name">;
}>;

export const EditableSeriesName = ({ className, series }: Props) => {
  const action = (formData: FormData) => {
    const _formData = new FormData();
    _formData.set("id", series.id);
    _formData.set("name", formData.get("value")?.toString() || "");

    return updateSeries(_formData);
  };

  return (
    <EditableText
      className={className}
      action={action}
      initialValue={series.name}
    />
  );
};
