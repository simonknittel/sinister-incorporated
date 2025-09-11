"use client";

import { type Operation } from "@prisma/client";
import { useState } from "react";
import { FaPen } from "react-icons/fa";
import EditOperationModal from "./EditOperationModal";

interface Props {
  operation: Operation;
}

const EditOperation = ({ operation }: Readonly<Props>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="text-neutral-500 hover:text-neutral-300 px-2"
        type="button"
        title="Operation bearbeiten"
        onClick={() => setIsOpen(true)}
      >
        <FaPen />
      </button>

      <EditOperationModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        operation={operation}
      />
    </>
  );
};

export default EditOperation;
