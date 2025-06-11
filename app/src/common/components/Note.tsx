import clsx from "clsx";
import { type ReactNode } from "react";
import { BsExclamationOctagonFill } from "react-icons/bs";
import { FaCheckSquare, FaInfoCircle } from "react-icons/fa";

interface Props {
  readonly className?: string;
  readonly message: ReactNode;
  readonly type?: "info" | "success" | "error";
  readonly error?: Error;
}

const Note = ({ className, message, type = "info", error }: Props) => {
  return (
    <div
      className={clsx(
        className,
        "rounded-primary border-t-2 p-4 flex gap-4 items-start",
        {
          "bg-blue-500/10 border-blue-500": type === "info",
          "bg-green-500/10 border-green-500": type === "success",
          "bg-sinister-red-500/10 border-sinister-red-500": type === "error",
        },
      )}
    >
      {type === "info" && (
        <FaInfoCircle className="text-blue-500 grow-1 shrink-0 mt-1" />
      )}
      {type === "success" && (
        <FaCheckSquare className="text-green-500 grow-1 shrink-0 mt-1" />
      )}
      {type === "error" && (
        <BsExclamationOctagonFill className="text-sinister-red-500 grow-1 shrink-0 mt-1" />
      )}

      <div>
        <div className="flex gap-2 items-center">{message}</div>

        {error && (
          <div className="text-neutral-500 mt-4">
            {"digest" in error ? (
              // @ts-expect-error
              <pre>Error digest: {error.digest}</pre>
            ) : (
              <pre>Error message: {error.message}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Note;
