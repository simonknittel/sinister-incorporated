import clsx from "clsx";
import { type ReactNode } from "react";
import { FaExclamationCircle } from "react-icons/fa";

interface Props {
  className?: string;
  message: ReactNode;
  error?: Error;
}

const Note = ({ className, message, error }: Props) => {
  return (
    <div
      className={clsx(
        className,
        "rounded bg-sinister-red-500/10 border-t-4 border-sinister-red-500 p-4 lg:p-8 max-w-4xl flex gap-4 items-start"
      )}
    >
      <FaExclamationCircle className="text-sinister-red-500 grow-1 shrink-0 mt-1" />

      <div>
        <div className="flex gap-2 items-center">
          <p>{message}</p>
        </div>

        {error && (
          <div className="text-neutral-500 mt-4">
            {"digest" in error ? (
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
