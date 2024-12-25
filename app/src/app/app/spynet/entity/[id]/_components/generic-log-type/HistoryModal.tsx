"use client";

import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import type { GenericEntityLogType } from "@/types";
import { type Entity } from "@prisma/client";
import { useState, type ComponentProps } from "react";
import { FaHistory } from "react-icons/fa";
import { ModalContent } from "./ModalContent";

interface Props {
  type: GenericEntityLogType;
  entity: Entity;
  iconOnly?: boolean;
  showCreate: ComponentProps<typeof ModalContent>["showCreate"];
  showDelete: ComponentProps<typeof ModalContent>["showDelete"];
  showConfirm: ComponentProps<typeof ModalContent>["showConfirm"];
}

export const HistoryModal = ({
  type,
  entity,
  iconOnly = false,
  showCreate,
  showDelete,
  showConfirm,
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
        <ModalContent
          type={type}
          entity={entity}
          showCreate={showCreate}
          showDelete={showDelete}
          showConfirm={showConfirm}
        />
      </Modal>
    </>
  );
};
