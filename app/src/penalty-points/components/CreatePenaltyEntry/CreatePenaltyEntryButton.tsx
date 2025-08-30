"use client";

import { Button2 } from "@/common/components/Button2";
import { useCreateContext } from "@/common/components/CreateContext";
import clsx from "clsx";
import { FaPlus } from "react-icons/fa";

interface Props {
  readonly className?: string;
}

export const CreatePenaltyEntryButton = ({ className }: Props) => {
  const { openCreateModal } = useCreateContext();

  return (
    <Button2
      onClick={() => openCreateModal("penaltyEntry")}
      variant="secondary"
      className={clsx(className)}
      title="Neue Strafpunkte"
    >
      <FaPlus />
      <span className="hidden md:inline">Neue Strafpunkte</span>
    </Button2>
  );
};
