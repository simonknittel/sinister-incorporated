"use client";

import { Button2 } from "@/common/components/Button2";
import { useCreateContext } from "@/common/components/CreateContext";
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
