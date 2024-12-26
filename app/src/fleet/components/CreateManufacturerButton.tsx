"use client";

import Button from "@/common/components/Button";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { FaPlus, FaSpinner } from "react-icons/fa";

const CreateManufacturerModal = dynamic(() =>
  import("./CreateManufacturerModal").then(
    (mod) => mod.CreateManufacturerModal,
  ),
);

export const CreateManufacturereButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setIsOpen(true)}>
        Neu {isOpen ? <FaSpinner className="animate-spin" /> : <FaPlus />}
      </Button>

      {isOpen && (
        /**
         * The `dynamic()` triggers the closest `Suspense` to show the fallback. This
         * leads to much bigger parts of the page or even the whole page showing the
         * fallback instead of only the button.
         */
        <Suspense>
          <CreateManufacturerModal onRequestClose={() => setIsOpen(false)} />
        </Suspense>
      )}
    </>
  );
};
