"use client";

import Note from "~/app/_components/Note";

interface Props {
  error: Error;
  reset: () => void;
}

export default function Error({ error }: Props) {
  return (
    <main>
      <Note
        message="Beim Laden der Events ist ein Fehler aufgetreten."
        error={error}
      />
    </main>
  );
}
