import { type EntityLog } from "@prisma/client";
import { BsExclamationOctagonFill } from "react-icons/bs";
import { FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { type EntityLogConfirmationState } from "~/types";
import ConfirmLog from "../../entity/[id]/_components/ConfirmLog";

interface Props {
  confirmationState?: EntityLogConfirmationState;
  entityLog: EntityLog;
}

const ConfirmationState = ({
  confirmationState,
  entityLog,
}: Readonly<Props>) => {
  switch (confirmationState) {
    case "confirmed":
      return (
        <div className="flex items-center gap-2">
          <FaCheckCircle className="grow-1 shrink-0" />
          Bestätigt
        </div>
      );

    case "false-report":
      return (
        <div className="flex items-center gap-2">
          <BsExclamationOctagonFill className="grow-1 shrink-0" />
          Falschmeldung
        </div>
      );

    default:
      return (
        <div className="flex items-center gap-2 text-blue-500">
          <FaInfoCircle className="grow-1 shrink-0" />
          Unbestätigt{" "}
          <span className="text-neutral-500 flex gap-1 mt-1">
            <ConfirmLog log={entityLog} compact={true} />
          </span>
        </div>
      );
  }
};

export default ConfirmationState;
