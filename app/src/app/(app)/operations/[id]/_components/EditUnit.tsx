"use client";

import { type OperationUnit } from "@prisma/client";
import { useState } from "react";
import { FaPen } from "react-icons/fa";
import EditUnitModal from "./EditUnitModal";

interface Props {
  unit: OperationUnit;
}

const EditUnit = ({ unit }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="text-neutral-500 hover:text-neutral-300 px-2"
        type="button"
        title="Unit bearbeiten"
        onClick={() => setIsOpen(true)}
      >
        <FaPen />
      </button>

      <EditUnitModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        unit={unit}
      />
    </>
  );
};

export default EditUnit;
