"use client";

import { Button2 } from "@/common/components/Button2";
import { RadioGroup } from "@/common/components/form/RadioGroup";
import clsx from "clsx";
import { useTopLoader } from "nextjs-toploader";
import { useQueryState } from "nuqs";
import { useEffect, useState, useTransition } from "react";
import { FaFilter } from "react-icons/fa";

interface Props {
  readonly className?: string;
}

export const Filters = ({ className }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, startTransition] = useTransition();
  const loader = useTopLoader();
  const [status, setStatus] = useQueryState("status", {
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
          onClick={() => setIsOpen((prev) => !prev)}
          variant="secondary"
          className="flex-1 md:hidden"
        >
          <FaFilter />
          Filter
        </Button2>
      </div>

      <div
        className={clsx("flex flex-col gap-[2px]", {
          "hidden md:flex": !isOpen,
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
      </div>
    </div>
  );
};
