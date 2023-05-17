import { type Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { FaCalendarDay, FaLock, FaSignInAlt, FaUsers } from "react-icons/fa";
import { RiSpyFill, RiSwordFill } from "react-icons/ri";
import { authorize } from "~/app/_utils/authorize";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import CreateRole from "./_components/CreateRole";
import DeleteRole from "./_components/DeleteRole";
import PermissionCheckbox from "./_components/PermissionCheckbox";

export const metadata: Metadata = {
  title: "Rollen und Berechtigungen | Sinister Incorporated",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!authorize("edit-roles-and-permissions", session)) redirect("/dashboard");

  const permissions = [
    {
      name: (
        <span>
          <span className="text-neutral-500 flex items-center gap-2">
            <FaSignInAlt className="rotate-90" />
          </span>
          Login
        </span>
      ),
      key: "login",
    },
    {
      name: (
        <span>
          <span className="text-neutral-500 flex items-center gap-2">
            <FaLock className="rotate-90" />
          </span>
          Rollen und Berechtigungen bearbeiten
        </span>
      ),
      key: "edit-roles-and-permissions",
    },
    {
      name: (
        <span>
          <span className="text-neutral-500 flex items-center gap-2">
            <FaUsers className="rotate-90" />
          </span>
          Logins einsehen
        </span>
      ),
      key: "view-logins",
    },
    {
      name: (
        <span>
          <span className="text-neutral-500 flex items-center gap-2">
            <RiSpyFill className="rotate-90" /> Spynet
          </span>
          Spynet einsehen
        </span>
      ),
      key: "view-spynet",
    },
    {
      name: (
        <span>
          <span className="text-neutral-500 flex items-center gap-2">
            <RiSpyFill className="rotate-90" /> Spynet
          </span>
          Neuen Citizen anlegen
        </span>
      ),
      key: "add-citizen",
    },
    {
      name: (
        <span>
          <span className="text-neutral-500 flex items-center gap-2">
            <RiSpyFill className="rotate-90" /> Spynet
          </span>
          Neue Organisation anlegen
        </span>
      ),
      key: "add-organization",
    },
    {
      name: (
        <span>
          <span className="text-neutral-500 flex items-center gap-2">
            <RiSpyFill className="rotate-90" /> Spynet
          </span>
          Neuen Handle hinzufügen
        </span>
      ),
      key: "add-handle",
    },
    {
      name: (
        <span>
          <span className="text-neutral-500 flex items-center gap-2">
            <RiSpyFill className="rotate-90" /> Spynet
          </span>
          Neue Discord ID hinzufügen
        </span>
      ),
      key: "add-discord-id",
    },
    {
      name: (
        <span>
          <span className="text-neutral-500 flex items-center gap-2">
            <RiSpyFill className="rotate-90" /> Spynet
          </span>
          Neue Notiz hinzufügen
        </span>
      ),
      key: "add-note",
    },
    {
      name: (
        <span>
          <span className="text-neutral-500 flex items-center gap-2">
            <FaCalendarDay className="rotate-90" /> Flotte
          </span>
          Gesamte Flotte einsehen
        </span>
      ),
      key: "view-org-fleet",
    },
    {
      name: (
        <span>
          <span className="text-neutral-500 flex items-center gap-2">
            <FaCalendarDay className="rotate-90" /> Flotte
          </span>
          Eigene Schiffe hinzufügen
        </span>
      ),
      key: "add-ship",
    },
    {
      name: (
        <span>
          <span className="text-neutral-500 flex items-center gap-2">
            <FaCalendarDay className="rotate-90" /> Flotte
          </span>
          Schiffsmodelle bearbeiten
        </span>
      ),
      key: "edit-manufacturers-series-and-variants",
    },
    {
      name: (
        <span>
          <span className="text-neutral-500 flex items-center gap-2">
            <FaCalendarDay className="rotate-90" /> Events
          </span>
          Alle Events einsehen
        </span>
      ),
      key: "view-events",
    },
    {
      name: (
        <span>
          <span className="text-neutral-500 flex items-center gap-2">
            <RiSwordFill className="rotate-90" /> Operationen
          </span>
          Alle Operationen einsehen
        </span>
      ),
      key: "view-operations",
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

                {permissions.map((permission) => (
                  <th
                    style={{
                      writingMode: "vertical-rl",
                    }}
                    key={permission.key}
                    className="p-2 text-left"
                  >
                    {permission.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="flex gap-2 p-2">
                    {role.name}

                    <DeleteRole role={role} />
                  </td>

                  {permissions.map((permission) => (
                    <td key={permission.key} className="p-2">
                      <PermissionCheckbox
                        key={permission.key}
                        permission={permission}
                        role={role}
                        checked={role.permissions.some(
                          (rolePermission) =>
                            rolePermission.key === permission.key
                        )}
                      />
                    </td>
                  ))}
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
