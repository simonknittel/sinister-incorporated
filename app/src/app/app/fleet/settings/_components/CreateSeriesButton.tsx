"use client";

import { type Manufacturer } from "@prisma/client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import Button from "../../../../_components/Button";

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
        Anlegen <FaPlus />
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
