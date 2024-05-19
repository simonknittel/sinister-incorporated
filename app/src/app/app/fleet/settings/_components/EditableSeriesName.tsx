"use client";

import { type Series } from "@prisma/client";
import { updateSeries } from "../../../../../lib/serverActions/series";
import { EditableText } from "../../../../_components/EditableText";

type Props = Readonly<{
  className?: string;
  series: Pick<Series, "id" | "name">;
}>;

export const EditableSeriesName = ({ className, series }: Props) => {
  const action = (newValue: string) => {
    return updateSeries({
      id: series.id,
      name: newValue,
    });
  };

  return (
    <EditableText
      className={className}
      action={action}
      initialValue={series.name}
    />
  );
};
