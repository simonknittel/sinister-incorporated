"use client";

import { type Manufacturer } from "@prisma/client";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import Button from "~/app/_components/Button";
import AddSeriesModal from "./AddSeriesModal";

interface Props {
  manufacturers: Manufacturer[];
}

const AddSeries = ({ manufacturers }: Readonly<Props>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Add series <FaPlus />
      </Button>

      <AddSeriesModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        manufacturers={manufacturers}
      />
    </>
  );
};

export default AddSeries;
