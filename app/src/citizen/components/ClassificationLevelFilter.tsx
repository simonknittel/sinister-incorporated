"use client";

import Button from "@/common/components/Button";
import YesNoCheckbox from "@/common/components/form/YesNoCheckbox";
import { useFilter } from "@/spynet/components/Filter";
import { type ClassificationLevel } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaSave } from "react-icons/fa";

interface FormValues {
  values: string[];
}

type Props = Readonly<{
  classificationLevels: ClassificationLevel[];
}>;

export const ClassificationLevelFilter = ({ classificationLevels }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setIsOpen } = useFilter();

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      values: (searchParams.get("filters")?.split(",") || []).filter(
        (filter) => {
          if (filter.startsWith("classification-level-")) return true;
          return false;
        },
      ),
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    let filters = newSearchParams.get("filters")?.split(",") || [];
    filters = filters.filter((filter) => {
      if (filter === "") return false;
      if (filter.startsWith("classification-level-")) return false;
      return true;
    });

    data.values.forEach((filter) => {
      filters.push(filter);
    });

    newSearchParams.set("filters", filters.join(","));

    router.push(`${pathname}?${newSearchParams.toString()}`);

    setIsOpen(false);
  };

  return (
    <form
      className={
        "flex flex-col items-start gap-2 px-4 py-2 rounded bg-neutral-800 max-h-96 overflow-auto"
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      {classificationLevels.map((noteType) => (
        <div
          key={noteType.id}
          className="flex justify-between items-center w-full gap-4"
        >
          <label className="flex gap-2 items-center whitespace-nowrap">
            {noteType.name}
          </label>

          <YesNoCheckbox
            {...register("values")}
            id={noteType.id}
            value={`classification-level-${noteType.id}`}
          />
        </div>
      ))}

      <div className="flex justify-end w-full">
        <Button type="submit" variant="primary">
          <FaSave /> Speichern
        </Button>
      </div>
    </form>
  );
};
