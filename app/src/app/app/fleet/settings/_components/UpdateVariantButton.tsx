"use client";

import { type Variant } from "@prisma/client";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { useState } from "react";
import { FaPen, FaSpinner } from "react-icons/fa";
import { useAction } from "../../../../_components/Actions";
import Button from "../../../../_components/Button";

const UpdateVariantModal = dynamic(() =>
  import("./UpdateVariantModal").then((mod) => mod.UpdateVariantModal),
);

type Props = Readonly<{
  className?: string;
  variant: Pick<Variant, "id">;
}>;

export const UpdateVariantButton = ({ className, variant }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const action = useAction();

  return (
    <div className={clsx(className, "flex justify-center")}>
      <Button variant="tertiary" onClick={() => setIsOpen(true)}>
        {isOpen ? <FaSpinner className="animate-spin" /> : <FaPen />} Bearbeiten
      </Button>

      {isOpen && (
        <UpdateVariantModal
          onRequestClose={() => {
            setIsOpen(false);
            action.setIsOpen(false);
          }}
          variant={variant}
        />
      )}
    </div>
  );
};
