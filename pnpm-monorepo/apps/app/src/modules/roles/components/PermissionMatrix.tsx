import { getRolesWithPermissionStrings } from "../queries/getRoles";
import { PermissionMatrixGrid } from "./PermissionMatrixGrid";

export const PermissionMatrix = async () => {
  const roles = await getRolesWithPermissionStrings();

  return (
    <section className="overflow-x-scroll rounded-primary bg-secondary p-4 lg:p-6">
      <PermissionMatrixGrid roles={roles} />
    </section>
  );
};
