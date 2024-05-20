"use client";

import Note from "../../_components/Note";

interface Props {
  error: Error;
  reset: () => void;
}

export default function Error({ error }: Readonly<Props>) {
  return (
    <main className="p-2 lg:p-8">
      <Note
        message="Beim Laden der Events ist ein Fehler aufgetreten."
        error={error}
      />
    </main>
  );
}
