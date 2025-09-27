"use client";

import { Button2 } from "@/modules/common/components/Button2";
import { useCreateContext } from "@/modules/common/components/CreateContext";
import { FaPlus } from "react-icons/fa";

export const CreateOrganizationButton = () => {
  const { openCreateModal } = useCreateContext();

  return (
    <Button2
      variant="secondary"
      onClick={() => openCreateModal("organization")}
      title="Neue Organisation erstellen"
    >
      <FaPlus /> Organisation
    </Button2>
  );
};
