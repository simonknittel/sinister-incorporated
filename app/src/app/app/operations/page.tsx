import { authenticatePage } from "@/auth/server";
import Note from "@/common/components/Note";
import { dedupedGetUnleashFlag } from "@/common/utils/getUnleashFlag";
import { prisma } from "@/db";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import CreateOperation from "./_components/CreateOperation";
import OperationTile from "./_components/OperationTile";

export const metadata: Metadata = {
  title: "Operationen | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  if (!(await dedupedGetUnleashFlag("EnableOperations"))) notFound();

  const authentication = await authenticatePage("/app/operations");
  await authentication.authorizePage("operation", "manage");

  const operations = await prisma.operation.findMany({
    include: {
      members: true,
    },
  });

  return (
    <main className="p-4 pb-20 lg:p-8">
      <h1 className="text-xl font-bold">Operationen</h1>

      <Note
        message={
          <p>
            Operationen sind aktuell in der Proof of Concept-Phase. Funktionen
            fehlen und es kann zu Fehlern kommen.
          </p>
        }
        className="mt-4"
      />

      {operations
        .toSorted((a, b) => a.title.localeCompare(b.title))
        .map((operation) => (
          <OperationTile
            key={operation.id}
            operation={operation}
            className="mt-4 max-w-4xl"
          />
        ))}

      {operations.length === 0 && (
        <div className="bg-neutral-800/50  rounded-2xl p-4 lg:p-8 max-w-4xl mt-4">
          <p>Aktuell sind keine Operationen geplant.</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-center max-w-4xl gap-4">
        <CreateOperation />
      </div>
    </main>
  );
}
