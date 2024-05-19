"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import Button from "../../../../_components/Button";

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
        Hersteller anlegen <FaPlus />
      </Button>

      {isOpen && (
        <CreateManufacturerModal onRequestClose={() => setIsOpen(false)} />
      )}
    </>
  );
};
