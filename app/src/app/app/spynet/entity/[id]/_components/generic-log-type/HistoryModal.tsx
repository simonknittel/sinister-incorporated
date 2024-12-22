"use client";

import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import type { GenericEntityLogType } from "@/types";
import { type Entity } from "@prisma/client";
import { useState } from "react";
import { FaHistory } from "react-icons/fa";
import { ModalContent } from "./ModalContent";

interface Props {
  type: GenericEntityLogType;
  entity: Entity;
  iconOnly?: boolean;
}

export const HistoryModal = ({
  type,
  entity,
  iconOnly = false,
}: Readonly<Props>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="tertiary"
        title="History"
      >
        <FaHistory /> {!iconOnly && <>History</>}
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
