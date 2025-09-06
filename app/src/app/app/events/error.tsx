"use client";

import Note from "@/common/components/Note";

interface Props {
  error: Error;
  reset: () => void;
}

export default function Error({ error }: Readonly<Props>) {
  return (
    <Note
      message="Beim Laden der Events ist ein Fehler aufgetreten."
      error={error}
    />
  );
}
