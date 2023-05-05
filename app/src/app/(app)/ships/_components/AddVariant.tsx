"use client";

import { type Series } from "@prisma/client";
import clsx from "clsx";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import Button from "~/app/_components/Button";
import AddVariantModal from "./AddVariantModal";

interface Props {
  className?: string;
  seriesId: Series["id"];
}

const AddVariant = ({ className, seriesId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={clsx(className, "flex justify-center")}>
      <Button variant="tertiary" onClick={() => setIsOpen(true)}>
        Add variant <FaPlus />
      </Button>

      <AddVariantModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        seriesId={seriesId}
      />
    </div>
  );
};

export default AddVariant;
