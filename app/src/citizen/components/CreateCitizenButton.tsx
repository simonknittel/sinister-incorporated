"use client";

import { Button2 } from "@/common/components/Button2";
import { useCreateContext } from "@/common/components/CreateContext";
import { FaPlus } from "react-icons/fa";

export const CreateCitizenButton = () => {
  const { openCreateModal } = useCreateContext();

  return (
    <Button2
      variant="secondary"
      onClick={() => openCreateModal("citizen")}
      title="Neuen Citizen erstellen"
      as="a"
    >
      <FaPlus /> Citizen
    </Button2>
  );
};
