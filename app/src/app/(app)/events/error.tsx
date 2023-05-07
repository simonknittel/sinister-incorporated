"use client";

import { FaExclamationCircle } from "react-icons/fa";

interface Props {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  return (
    <main>
      <div className="rounded bg-sinister-red-500/10 border-t-4 border-sinister-red-500 p-4 lg:p-8 max-w-4xl flex gap-4 items-start">
        <FaExclamationCircle className="text-sinister-red-500 grow-1 shrink-0 mt-1" />

        <div>
          <div className="flex gap-2 items-center">
            <p>Beim Laden der Events ist ein Fehler aufgetreten.</p>

            <button onClick={() => reset()} className="underline">
              Erneut versuchen
            </button>
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
    </main>
  );
}
