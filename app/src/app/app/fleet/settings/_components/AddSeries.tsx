"use client";

import { type Manufacturer } from "@prisma/client";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import Button from "../../../../_components/Button";
import { AddSeriesModal } from "./AddSeriesModal";

type Props = Readonly<{
  className?: string;
  manufacturerId: Manufacturer["id"];
}>;

export const AddSeries = ({ className, manufacturerId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className={className}
        variant="tertiary"
        onClick={() => setIsOpen(true)}
      >
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
