"use client";

import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import Button from "~/app/_components/Button";
import AddManufacturerModal from "./AddManufacturerModal";

const AddManufacturer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Add manufacturer <FaPlus />
      </Button>

      <AddManufacturerModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default AddManufacturer;
