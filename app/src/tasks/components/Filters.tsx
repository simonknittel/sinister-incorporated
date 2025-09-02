"use client";

import { Button2 } from "@/common/components/Button2";
import { RadioFilter } from "@/common/components/SidebarFilters/RadioFilter";
import clsx from "clsx";
import { useState } from "react";
import { FaFilter } from "react-icons/fa";
import { CreateTaskButton } from "./CreateTask/CreateTaskButton";

interface Props {
  readonly className?: string;
  readonly showCreateTask?: boolean | null;
}

export const Filters = ({ className, showCreateTask = false }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={clsx(className)}>
      <div className="flex gap-2">
        <Button2
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          variant="secondary"
          className="flex-1 md:hidden"
        >
          <FaFilter />
          Filter
        </Button2>

        {showCreateTask && <CreateTaskButton className="flex-1" />}
      </div>

      <div
        className={clsx("flex flex-col gap-[2px]", {
          "mt-4": showCreateTask,
          "hidden md:flex": !isOpen,
        })}
      >
        <RadioFilter
          name="status"
          label="Status"
          items={[
            { value: "open", label: "Offen", default: true },
            { value: "closed", label: "Geschlossen" },
          ]}
        />

        <RadioFilter
          name="accepted"
          label="Angenommen von"
          items={[
            { value: "all", label: "Alle", default: true },
            { value: "yes", label: "Mir" },
          ]}
        />

        <RadioFilter
          name="created_by"
          label="Erstellt von"
          items={[
            { value: "others", label: "Alle", default: true },
            { value: "me", label: "Mir" },
          ]}
        />
      </div>
    </div>
  );
};
