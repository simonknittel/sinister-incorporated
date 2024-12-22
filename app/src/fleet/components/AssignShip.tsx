"use client";

import Button from "@/common/components/Button";
import { type Manufacturer, type Series, type Variant } from "@prisma/client";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import AssignShipModal from "./AssignShipModal";

interface Props {
  className?: string;
  data?: (Manufacturer & {
    series: (Series & {
      variants: Variant[];
    })[];
  })[];
}

const AssignShip = ({ className, data = [] }: Readonly<Props>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="tertiary"
        className={className}
      >
        Hinzufügen <FaPlus />
      </Button>

      <AssignShipModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        data={data}
      />
    </>
  );
};

export default AssignShip;
