"use client";

import { type Entity } from "@prisma/client";
import { useState } from "react";
import { FaHistory } from "react-icons/fa";
import Button from "~/app/_components/Button";
import Modal from "~/app/_components/Modal";
import { type GenericEntityLogType } from "~/types";
import { ModalContent } from "./ModalContent";

interface Props {
  type: GenericEntityLogType;
  entity: Entity;
}

export const HistoryModal = ({ type, entity }: Readonly<Props>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="tertiary"
        title="Bearbeiten"
      >
        <FaHistory /> History
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="w-[768px]"
      >
        <ModalContent type={type} entity={entity} />
      </Modal>
    </>
  );
};
