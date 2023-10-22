"use client";

import { type ClassificationLevel } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaChevronDown, FaSave } from "react-icons/fa";
import Button from "~/app/_components/Button";
import YesNoCheckbox from "~/app/_components/YesNoCheckbox";

interface FormValues {
  values: string[];
}

interface Props {
  classificationLevels: ClassificationLevel[];
}

const ClassificationLevelFilterButton = ({ classificationLevels }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button onClick={() => setIsOpen((value) => !value)} variant="secondary">
        <FaChevronDown /> Geheimstufen
      </Button>

      {isOpen && (
        <Inner
          classificationLevels={classificationLevels}
          onRequestClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ClassificationLevelFilterButton;

interface InnerProps {
  classificationLevels: ClassificationLevel[];
  onRequestClose?: () => void;
}

const Inner = ({ classificationLevels, onRequestClose }: InnerProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

    onRequestClose?.();
  };

  return (
    <form
      className={
        "absolute top-[calc(100%+.5rem)] left-0 flex flex-col items-start gap-2 px-4 py-2 rounded bg-neutral-800 border border-neutral-900 z-10 max-h-96 overflow-auto"
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
            register={register("values")}
            id={noteType.id}
            value={`classification-level-${noteType.id}`}
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
