"use client";

import Button from "@/common/components/Button";
import dynamic from "next/dynamic";
import { useState } from "react";
import { FaPlus, FaSpinner } from "react-icons/fa";

const CreateManufacturerModal = dynamic(() =>
  import("./CreateManufacturerModal").then(
    (mod) => mod.CreateManufacturerModal,
  ),
);

export const CreateManufacturereButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setIsOpen(true)}>
        Neu {isOpen ? <FaSpinner className="animate-spin" /> : <FaPlus />}
      </Button>

      {isOpen && (
        <CreateManufacturerModal onRequestClose={() => setIsOpen(false)} />
      )}
    </>
  );
};
