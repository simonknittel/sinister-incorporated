"use client";

import { PopoverBaseUI } from "@/modules/common/components/PopoverBaseUI";
import { RoleOptionButton } from "@/modules/roles/components/RoleOptionButton";
import { SelectedRoleBadge } from "@/modules/roles/components/SelectedRoleBadge";
import { api } from "@/trpc/react";
import type { Role } from "@sam-monorepo/database/browser";
import clsx from "clsx";
import { useState } from "react";
import { FaUsers } from "react-icons/fa";

interface Props {
  readonly className?: string;
  /** Name of the hidden inputs, e.g. "readRole[]" */
  readonly inputName: string;
  readonly defaultValue?: Role["id"][];
  /**
   * Pick exactly one role instead of many: picking replaces the current
   * selection, so at most one hidden input is submitted.
   */
  readonly single?: boolean;
  /**
   * Restricts the offered roles, e.g. to those allowed to read the parent
   * page. Already selected roles outside the list stay selected and
   * removable so the reason for a rejected save stays visible.
   */
  readonly selectableRoleIds?: readonly Role["id"][];
}

/**
 * Role picker submitting the selected role ids as hidden inputs — multi
 * select by default, see `single`.
 */
export const WikiRoleSelector = ({
  className,
  inputName,
  defaultValue,
  single = false,
  selectableRoleIds,
}: Props) => {
  const { isPending, data: allRoles } =
    api.roles.getVisibleRoles.useQuery(undefined);

  const selectableRoles = selectableRoleIds
    ? allRoles?.filter((role) => selectableRoleIds.includes(role.id))
    : allRoles;

  const [selectedRoles, setSelectedRoles] = useState<Role["id"][]>(
    defaultValue || [],
  );

  const handleSelectRole = (roleId: Role["id"]) => {
    setSelectedRoles((previous) => {
      if (single) return [roleId];
      if (previous.includes(roleId)) return previous;
      return [...previous, roleId];
    });
  };

  const handleRemoveRole = (roleId: Role["id"]) => {
    setSelectedRoles((previous) =>
      previous.filter((selectedRoleId) => selectedRoleId !== roleId),
    );
  };

  return (
    <div className={clsx(className)}>
      <PopoverBaseUI
        title="Rolle auswählen"
        trigger={
          <span
            className={clsx(
              "flex h-9 items-center gap-2 rounded-secondary border border-neutral-700 px-3 text-sm hover:bg-neutral-800",
              { "opacity-50": isPending },
            )}
          >
            <FaUsers /> {single ? "Rolle auswählen" : "Rolle hinzufügen"}
          </span>
        }
        childrenClassName="max-h-96 overflow-auto"
      >
        <div className="flex flex-col gap-2">
          {selectableRoles?.map((role) => (
            <RoleOptionButton
              key={role.id}
              roleId={role.id}
              onSelect={handleSelectRole}
            />
          ))}
        </div>
      </PopoverBaseUI>

      {selectedRoles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedRoles.map((selectedRoleId) => (
            <SelectedRoleBadge
              key={selectedRoleId}
              roleId={selectedRoleId}
              name={inputName}
              onRemove={handleRemoveRole}
            />
          ))}
        </div>
      )}
    </div>
  );
};
