"use client";

import Note from "~/app/_components/Note";

interface Props {
  error: Error;
  reset: () => void;
}

export default function Error({ error }: Readonly<Props>) {
  return (
    <main className="p-2 lg:p-8 pt-20">
      <Note
        message="Beim Laden der Events ist ein Fehler aufgetreten."
        error={error}
      />
    </main>
  );
}
