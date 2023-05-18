import { prisma } from "~/server/db";
import CreateRole from "./CreateRole";
import DeleteRole from "./DeleteRole";
import RolePermissions from "./RolePermissions";

const Roles = async () => {
  const roles = await prisma.role.findMany({
    include: {
      permissions: true,
    },
  });

  return (
    <section className="mt-4 p-4 lg:p-8 rounded bg-neutral-900 overflow-auto max-w-4xl">
      {roles.map((role) => (
        <div key={role.id}>
          <div className="flex justify-between gap-2 p-2">
            {role.name}

            <div className="flex gap-4 items-center">
              <RolePermissions role={role} />
              {/* <ImpersonateRole role={role} /> */}
              <DeleteRole role={role} />
            </div>
          </div>
        </div>
      ))}

      <CreateRole />
    </section>
  );
};

export default Roles;
