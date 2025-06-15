"use client";

import Note from "@/common/components/Note";

interface Props {
  error: Error;
  reset: () => void;
}

export default function Error({ error }: Readonly<Props>) {
  return (
    <main className="p-4 pb-20 lg:p-6">
      <Note
        message="Beim Laden der Events ist ein Fehler aufgetreten."
        error={error}
      />
    </main>
  );
}
