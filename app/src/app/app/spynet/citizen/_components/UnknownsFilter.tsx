"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaSave } from "react-icons/fa";
import Button from "../../../../_components/Button";
import YesNoCheckbox from "../../../../_components/YesNoCheckbox";
import { useFilter } from "../../_components/Filter";

interface FormValues {
  values: string[];
}

type Props = Readonly<{
  showDiscordId?: boolean;
  showTeamspeakId?: boolean;
}>;

export const UnknownsFilter = ({
  showDiscordId = false,
  showTeamspeakId = false,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setIsOpen } = useFilter();

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      values: (searchParams.get("filters")?.split(",") || []).filter(
        (filter) => {
          if (filter.startsWith("unknown-")) return true;
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
      if (filter.startsWith("unknown-")) return false;
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
        "flex flex-col items-start gap-2 px-4 py-2 rounded bg-neutral-800"
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex justify-between items-center w-full gap-4">
        <label
          className="whitespace-nowrap cursor-pointer"
          htmlFor="unknown-handle"
        >
          Handles
        </label>
        <YesNoCheckbox
          {...register("values")}
          id="unknown-handle"
          value="unknown-handle"
        />
      </div>

      {showDiscordId && (
        <div className="flex justify-between items-center w-full gap-4">
          <label
            className="whitespace-nowrap cursor-pointer"
            htmlFor="unknown-discord-id"
          >
            Discord IDs
          </label>
          <YesNoCheckbox
            {...register("values")}
            id="unknown-discord-id"
            value="unknown-discord-id"
          />
        </div>
      )}

      {showTeamspeakId && (
        <div className="flex justify-between items-center w-full gap-4">
          <label
            className="whitespace-nowrap cursor-pointer"
            htmlFor="unknown-teamspeak-id"
          >
            TeamSpeak IDs
          </label>
          <YesNoCheckbox
            {...register("values")}
            id="unknown-teamspeak-id"
            value="unknown-teamspeak-id"
          />
        </div>
      )}

      <div className="flex justify-end w-full">
        <Button variant="primary">
          <FaSave /> Speichern
        </Button>
      </div>
    </form>
  );
};
