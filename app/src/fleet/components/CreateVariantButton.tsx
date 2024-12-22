"use client";

import Button from "@/common/components/Button";
import { type Manufacturer, type Series } from "@prisma/client";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { useState } from "react";
import { FaPlus, FaSpinner } from "react-icons/fa";

const CreateVariantModal = dynamic(() =>
  import("./CreateVariantModal").then((mod) => mod.CreateVariantModal),
);

type Props = Readonly<{
  className?: string;
  manufacturerId: Manufacturer["id"];
  seriesId: Series["id"];
}>;

export const CreateVariantButton = ({
  className,
  manufacturerId,
  seriesId,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={clsx(className, "flex justify-center")}>
      <Button
        variant="tertiary"
        onClick={() => setIsOpen(true)}
        title="Variante anlegen"
      >
        Anlegen {isOpen ? <FaSpinner className="animate-spin" /> : <FaPlus />}
      </Button>

      {isOpen && (
        <CreateVariantModal
          onRequestClose={() => setIsOpen(false)}
          manufacturerId={manufacturerId}
          seriesId={seriesId}
        />
      )}
    </div>
  );
};
