"use client";

import { type Manufacturer } from "@prisma/client";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import Button from "../../../../_components/Button";
import { CreateSeriesModal } from "./CreateSeriesModal";

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
