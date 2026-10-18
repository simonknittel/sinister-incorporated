import { getRolesWithInheritance } from "../queries/getRoles";
import { InheritanceMatrixGrid } from "./InheritanceMatrixGrid";

export const InheritanceMatrix = async () => {
  const roles = await getRolesWithInheritance();

  return (
    <section className="overflow-x-scroll rounded-primary bg-secondary p-4 lg:p-6">
      <p className="max-w-prose">
        Eine markierte Zelle bedeutet: Die Rolle der Zeile erhält alle
        Berechtigungen der Rolle der Spalte. Verschachtelte Vererbungen werden
        nicht berücksichtigt.
      </p>

      <InheritanceMatrixGrid roles={roles} />
    </section>
  );
};
