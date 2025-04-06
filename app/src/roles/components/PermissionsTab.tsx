"use client";

import { Tile } from "@/common/components/Tile";
import type {
  ClassificationLevel,
  Flow,
  NoteType,
  PermissionString,
  Role,
} from "@prisma/client";
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
  flows: Flow[];
}>;

export const PermissionsTab = ({
  className,
  role,
  noteTypes,
  classificationLevels,
  allRoles,
  enableOperations,
  flows,
}: Props) => {
  return (
    <Tile heading="Berechtigungen" className={className}>
      <PermissionsProvider role={role}>
        <Permissions
          role={role}
          noteTypes={noteTypes}
          classificationLevels={classificationLevels}
          allRoles={allRoles}
          enableOperations={Boolean(enableOperations)}
          flows={flows}
        />
      </PermissionsProvider>
    </Tile>
  );
};
