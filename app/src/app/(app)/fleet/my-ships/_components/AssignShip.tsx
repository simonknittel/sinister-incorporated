"use client";

import { type Manufacturer, type Series, type Variant } from "@prisma/client";
import clsx from "clsx";
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
      <button
        className={clsx(
          className,
          "flex items-center justify-center gap-2 text-sinister-red-500 border-sinister-red-500 border rounded-2xl font-bold uppercase hover:text-sinister-red-300 hover:border-sinister-red-300 min-h-[3rem] lg:min-h-[6rem]",
        )}
        onClick={() => setIsOpen(true)}
      >
        Hinzufügen <FaPlus />
      </button>

      <AssignShipModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        data={data}
      />
    </>
  );
};

export default AssignShip;
