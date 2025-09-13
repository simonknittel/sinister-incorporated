"use client";

import { Button2 } from "@/modules/common/components/Button2";
import { useCreateContext } from "@/modules/common/components/CreateContext";
import clsx from "clsx";
import { FaPlus } from "react-icons/fa";

interface Props {
  readonly className?: string;
}

export const CreateProfitDistributionCycleButton = ({ className }: Props) => {
  const { openCreateModal } = useCreateContext();

  return (
    <Button2
      onClick={() => openCreateModal("profitDistributionCycle")}
      className={clsx(className)}
      title="Neuer Gewinnverteilungszeitraum"
    >
      <FaPlus />
      <span className="hidden sm:inline">Neuer Gewinnverteilungszeitraum</span>
    </Button2>
  );
};
