import { type Metadata } from "next";
import { FaCalendarDay, FaLock, FaSignInAlt, FaUsers } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { RiSpyFill, RiSwordFill } from "react-icons/ri";
import { authenticateAndAuthorizePage } from "~/app/_utils/authenticateAndAuthorize";
import { prisma } from "~/server/db";
import CreateRole from "./_components/CreateRole";
import DeleteRole from "./_components/DeleteRole";
import ImpersonateRole from "./_components/ImpersonateRole";
import PermissionCheckbox from "./_components/PermissionCheckbox";

export const metadata: Metadata = {
  title: "Rollen und Berechtigungen | Sinister Incorporated",
};

export default async function Page() {
  await authenticateAndAuthorizePage("edit-roles-and-permissions");

  const permissionGroups = [
    {
      name: "",
      icon: <FaSignInAlt />,
      permissions: [
        {
          name: "Login",
          key: "login",
        },
      ],
    },
    {
      name: "",
      icon: <FaLock />,
      permissions: [
        {
          name: "Rollen und Berechtigungen bearbeiten",
          key: "edit-roles-and-permissions",
        },
      ],
    },
    {
      name: "",
      icon: <FaUsers />,
      permissions: [
        {
          name: "Logins einsehen",
          key: "view-logins",
        },
      ],
    },
    {
      name: "Spynet",
      icon: <RiSpyFill />,
      permissions: [
        {
          name: "Spynet einsehen",
          key: "view-spynet",
        },
        {
          name: "Neuen Citizen anlegen",
          key: "add-citizen",
        },
        {
          name: "Neue Organisation anlegen",
          key: "add-organization",
        },
        {
          name: "Neuen Handle hinzufügen",
          key: "add-handle",
        },
        {
          name: "Neue Discord ID hinzufügen",
          key: "add-discord-id",
        },
        {
          name: "Neue Notiz hinzufügen",
          key: "add-note",
        },
      ],
    },
    {
      name: "Flotte",
      icon: <MdWorkspaces />,
      permissions: [
        {
          name: "Gesamte Flotte einsehen",
          key: "view-org-fleet",
        },
        {
          name: "Eigene Schiffe hinzufügen",
          key: "add-ship",
        },
        {
          name: "Schiffsmodelle bearbeiten",
          key: "edit-manufacturers-series-and-variants",
        },
      ],
    },
    {
      name: "Events",
      icon: <FaCalendarDay />,
      permissions: [
        {
          name: "Alle Events einsehen",
          key: "view-events",
        },
      ],
    },
    {
      name: "Operationen",
      icon: <RiSwordFill />,
      permissions: [
        {
          name: "Alle Operationen einsehen",
          key: "view-operations",
        },
      ],
    },
  ];

  const roles = await prisma.role.findMany({
    include: {
      permissions: true,
    },
  });

  return (
    <main className="p-4 lg:p-8 pt-20">
      <h1 className="text-xl font-bold">Rollen und Berechtigungen</h1>

      <section className="mt-4 p-4 lg:p-8 rounded bg-neutral-900 overflow-auto">
        <div className="min-w-[1024px]">
          <table>
            <thead>
              <tr>
                <td />

                {permissionGroups.flatMap((permissionGroup) =>
                  permissionGroup.permissions.map((permission) => (
                    <th
                      key={permission.key}
                      className="p-2 text-left"
                      style={{
                        writingMode: "vertical-rl",
                      }}
                    >
                      <span className="text-neutral-500 flex items-center gap-2">
                        <span className="rotate-90">
                          {permissionGroup.icon}
                        </span>

                        {permissionGroup.name}
                      </span>

                      <span>{permission.name}</span>
                    </th>
                  ))
                )}
              </tr>
            </thead>

            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="flex justify-between gap-2 p-2">
                    {role.name}

                    <div className="flex">
                      <ImpersonateRole role={role} />
                      <DeleteRole role={role} />
                    </div>
                  </td>

                  {permissionGroups.flatMap((permissionGroup) => {
                    return permissionGroup.permissions.map((permission) => (
                      <td
                        key={`${permissionGroup.name}_${permission.key}`}
                        className="p-2"
                      >
                        <PermissionCheckbox
                          permission={permission}
                          role={role}
                          checked={role.permissions.some(
                            (rolePermission) =>
                              rolePermission.key === permission.key
                          )}
                        />
                      </td>
                    ));
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <CreateRole />
        </div>
      </section>
    </main>
  );
}
