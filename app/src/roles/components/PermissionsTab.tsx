"use client";

import type {
  ClassificationLevel,
  NoteType,
  PermissionString,
  Role,
} from "@prisma/client";
import clsx from "clsx";
import { Permissions } from "./Permissions";
import { PermissionsProvider } from "./PermissionsContext";

type Props = Readonly<{
  className?: string;
  role: Role & {
    permissionStrings: PermissionString[];
  };
  noteTypes: NoteType[];
  classificationLevels: ClassificationLevel[];
  allRoles: Role[];
  enableOperations: boolean;
}>;

export const PermissionsTab = ({
  className,
  role,
  noteTypes,
  classificationLevels,
  allRoles,
  enableOperations,
}: Props) => {
  return (
    <section
      className={clsx("rounded-2xl bg-neutral-800/50 p-4 lg:p-8", className)}
    >
      <h2 className="text-xl font-bold mb-4">Berechtigungen</h2>

      <PermissionsProvider role={role}>
        <Permissions
          role={role}
          noteTypes={noteTypes}
          classificationLevels={classificationLevels}
          allRoles={allRoles}
          enableOperations={Boolean(enableOperations)}
        />
      </PermissionsProvider>
    </section>
  );
};
