"use client";

import { FaExclamationCircle } from "react-icons/fa";

interface Props {
  reset: () => void;
}

export default function Error({ reset }: Props) {
  return (
    <main>
      <div className="rounded bg-sinister-red-500/10 border-t-4 border-sinister-red-500 p-4 lg:p-8 max-w-4xl flex gap-2 items-center">
        <FaExclamationCircle className="text-sinister-red-500" />
        <p>Beim Laden der Events ist ein Fehler aufgetreten.</p>
        <button onClick={() => reset()} className="underline">
          Erneut versuchen
        </button>
      </div>
    </main>
  );
}
