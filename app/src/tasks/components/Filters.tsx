"use client";

import { Button2 } from "@/common/components/Button2";
import { RadioGroup } from "@/common/components/form/RadioGroup";
import clsx from "clsx";
import { useTopLoader } from "nextjs-toploader";
import { useQueryState } from "nuqs";
import { useEffect, useState, useTransition } from "react";
import { FaFilter } from "react-icons/fa";
import { CreateTask } from "./CreateTask";

interface Props {
  readonly className?: string;
  readonly showCreateTask?: boolean | null;
}

export const Filters = ({ className, showCreateTask = false }: Props) => {
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, startTransition] = useTransition();
  const loader = useTopLoader();
  const [status, setStatus] = useQueryState("status", {
    shallow: false,
    startTransition,
  });
  const [createdBy, setCreatedBy] = useQueryState("created_by", {
    shallow: false,
    startTransition,
  });
  const [accepted, setAccepted] = useQueryState("accepted", {
    shallow: false,
    startTransition,
  });

  useEffect(() => {
    if (isLoading) {
      loader.start();
    }
  }, [loader, isLoading]);

  return (
    <div className={clsx(className)}>
      <div className="flex gap-2">
        <Button2
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          variant="secondary"
          className="flex-1 md:hidden"
        >
          <FaFilter />
          Filter
        </Button2>

        {showCreateTask && <CreateTask className="flex-1" />}
      </div>

      <div
        className={clsx("flex flex-col gap-[2px] mt-4", {
          "hidden md:flex": !showFilters,
        })}
      >
        <div className="background-secondary rounded-primary p-2">
          <p className="text-sm text-neutral-500">Status</p>

          <RadioGroup
            name="status"
            items={[
              { value: "open", label: "Offen" },
              { value: "closed", label: "Geschlossen" },
            ]}
            value={status || "open"}
            onChange={setStatus}
            className="mt-1"
          />
        </div>

        <div className="background-secondary rounded-primary p-2">
          <p className="text-sm text-neutral-500">Angenommen von</p>

          <RadioGroup
            name="accepted"
            items={[
              { value: "all", label: "Alle" },
              { value: "yes", label: "Mir" },
            ]}
            value={accepted || "all"}
            onChange={setAccepted}
            className="mt-1"
          />
        </div>

        <div className="background-secondary rounded-primary p-2">
          <p className="text-sm text-neutral-500">Erstellt von</p>

          <RadioGroup
            name="created_by"
            items={[
              { value: "others", label: "Alle" },
              { value: "me", label: "Mir" },
            ]}
            value={createdBy || "others"}
            onChange={setCreatedBy}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};
