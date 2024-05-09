"use client";

import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import Button from "../../../../_components/Button";
import { CreateManufacturerModal } from "./CreateManufacturerModal";

export const CreateManufacturereButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setIsOpen(true)}>
        Hersteller anlegen <FaPlus />
      </Button>

      <CreateManufacturerModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
      />
    </>
  );
};
