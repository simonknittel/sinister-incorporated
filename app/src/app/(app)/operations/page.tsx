import { type Metadata } from "next";
import Note from "~/app/_components/Note";
import { prisma } from "~/server/db";
import CreateOperation from "./_components/CreateOperation";
import OperationTile from "./_components/OperationTile";

export const metadata: Metadata = {
  title: "Operationen | Sinister Incorporated",
};

export default async function Page() {
  const operations = await prisma.operation.findMany({
    include: {
      members: true,
    },
  });

  return (
    <main className="p-4 lg:p-8 pt-20">
      <h1 className="text-xl font-bold">Operationen</h1>

      <Note
        message="Operationen sind aktuell in der Proof of Concept-Phase. Funktionen fehlen und es kann zu Fehlern kommen."
        className="mt-4"
      />

      {operations
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((operation) => (
          <OperationTile
            key={operation.id}
            operation={operation}
            className="mt-4 max-w-4xl"
          />
        ))}

      {operations.length === 0 && (
        <div className="bg-neutral-900 rounded p-4 lg:p-8 max-w-4xl mt-4">
          <p>Aktuell sind keine Operationen geplant.</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-center max-w-4xl gap-4">
        <CreateOperation />
      </div>
    </main>
  );
}
