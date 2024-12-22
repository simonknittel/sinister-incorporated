"use client";

import Button from "@/common/components/Button";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import CreateOperationModal from "./CreateOperationModal";

const CreateOperation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Neue Operation <FaPlus />
      </Button>

      <CreateOperationModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default CreateOperation;
