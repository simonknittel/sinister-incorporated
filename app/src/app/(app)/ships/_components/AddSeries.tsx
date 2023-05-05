"use client";

import { type Manufacturer } from "@prisma/client";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import Button from "~/components/Button";
import AddSeriesModal from "./AddSeriesModal";

interface Props {
  manufacturerId: Manufacturer["id"];
}

const AddSeries = ({ manufacturerId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Add series <FaPlus />
      </Button>

      <AddSeriesModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        manufacturerId={manufacturerId}
      />
    </>
  );
};

export default AddSeries;
