"use client";

import Button from "@/common/components/Button";
import { type OperationUnit } from "@prisma/client";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import CreateSquadronFlightModal from "./CreateSquadronFlightModal";

interface Props {
  parentUnit: OperationUnit;
}

const CreateSquadronFlight = ({ parentUnit }: Readonly<Props>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center">
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Flight hinzufügen <FaPlus />
      </Button>

      <CreateSquadronFlightModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        parentUnit={parentUnit}
      />
    </div>
  );
};

export default CreateSquadronFlight;
