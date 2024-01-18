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
        <div className="flex items-center gap-2 overflow-hidden">
          <FaCheckCircle className="grow-1 shrink-0" />
          <span className="overflow-hidden text-ellipsis">Bestätigt</span>
        </div>
      );

    case "false-report":
      return (
        <div className="flex items-center gap-2 overflow-hidden">
          <BsExclamationOctagonFill className="grow-1 shrink-0" />
          <span className="overflow-hidden text-ellipsis">Falschmeldung</span>
        </div>
      );

    default:
      return (
        <div className="flex items-center gap-2 text-blue-500 overflow-hidden">
          <FaInfoCircle className="grow-1 shrink-0" />
          <span className="overflow-hidden text-ellipsis">Unbestätigt</span>
          <span className="text-neutral-500 flex gap-1 mt-1">
            <ConfirmLog log={entityLog} compact={true} />
          </span>
        </div>
      );
  }
};

export default ConfirmationState;
