"use client";

import Button from "@/common/components/Button";
import { type Manufacturer } from "@prisma/client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { FaPlus, FaSpinner } from "react-icons/fa";

const CreateSeriesModal = dynamic(() =>
  import("./CreateSeriesModal").then((mod) => mod.CreateSeriesModal),
);

type Props = Readonly<{
  className?: string;
  manufacturerId?: Manufacturer["id"];
}>;

export const CreateSeriesButton = ({ className, manufacturerId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className={className}
        variant="tertiary"
        onClick={() => setIsOpen(true)}
        title="Serie anlegen"
      >
        Anlegen {isOpen ? <FaSpinner className="animate-spin" /> : <FaPlus />}
      </Button>

      {isOpen && (
        <CreateSeriesModal
          onRequestClose={() => setIsOpen(false)}
          manufacturerId={manufacturerId}
        />
      )}
    </>
  );
};
