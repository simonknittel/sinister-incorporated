"use client";

import { type NoteType } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaSave } from "react-icons/fa";
import Button from "../../../../_components/Button";
import YesNoCheckbox from "../../../../_components/YesNoCheckbox";
import { useFilter } from "../../_components/Filter";

interface FormValues {
  values: string[];
}

interface Props {
  noteTypes: NoteType[];
}

const RoleFilter = ({ noteTypes }: Readonly<Props>) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setIsOpen } = useFilter();

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      values: (searchParams.get("filters")?.split(",") || []).filter(
        (filter) => {
          if (filter.startsWith("note-type-")) return true;
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
      if (filter.startsWith("note-type-")) return false;
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
      {noteTypes.map((noteType) => (
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
            value={`note-type-${noteType.id}`}
          />
        </div>
      ))}

      <div className="flex justify-end w-full">
        <Button variant="primary">
          <FaSave /> Speichern
        </Button>
      </div>
    </form>
  );
};

export default RoleFilter;
