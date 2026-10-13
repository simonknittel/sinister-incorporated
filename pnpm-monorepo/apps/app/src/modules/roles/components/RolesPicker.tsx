"use client";

import { Button2, Button2Variant } from "@/modules/common/components/Button2";
import { PopoverBaseUI } from "@/modules/common/components/PopoverBaseUI";
import type { Role } from "@sam-monorepo/database/browser";
import { useState, type ReactNode } from "react";
import { FaUsers } from "react-icons/fa";
import { RoleOptionButton } from "./RoleOptionButton";
import { useRolesContext } from "./RolesContext";
import { SelectedRoleBadge } from "./SelectedRoleBadge";

interface Props {
  readonly className?: string;
  /** The form field name of the hidden input of each selected role */
  readonly name: string;
  readonly label: string;
  readonly helpText?: ReactNode;
  readonly defaultValue?: readonly Role["id"][];
}

/** Offers the roles that the viewer can see and submits the selected roles */
export const RolesPicker = ({
  className,
  name,
  label,
  helpText,
  defaultValue,
}: Props) => {
  const { roles } = useRolesContext();
  const [selectedRoleIds, setSelectedRoleIds] = useState<readonly Role["id"][]>(
    defaultValue ?? [],
  );

  const selectRole = (roleId: Role["id"]) => {
    setSelectedRoleIds((previous) =>
      previous.includes(roleId) ? previous : [...previous, roleId],
    );
  };

  const removeRole = (roleId: Role["id"]) => {
    setSelectedRoleIds((previous) =>
      previous.filter((selectedRoleId) => selectedRoleId !== roleId),
    );
  };

  return (
    <div className={className}>
      <p className="mb-1">{label}</p>

      <PopoverBaseUI
        title="Rolle auswählen"
        trigger={
          <>
            <FaUsers /> Rolle auswählen
          </>
        }
        triggerRender={
          <Button2
            type="button"
            title="Rolle auswählen"
            variant={Button2Variant.Secondary}
            className="flex-none"
          />
        }
        openOnHover={false}
        positionerClassName="z-40"
        childrenClassName="max-h-96 overflow-auto"
      >
        <div className="flex flex-col gap-2">
          {roles.map((role) => (
            <RoleOptionButton
              key={role.id}
              roleId={role.id}
              onSelect={selectRole}
            />
          ))}
        </div>
      </PopoverBaseUI>

      {helpText && <p className="mt-1 text-xs text-gray-400">{helpText}</p>}

      {selectedRoleIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedRoleIds.map((roleId) => (
            <SelectedRoleBadge
              key={roleId}
              roleId={roleId}
              name={name}
              onRemove={removeRole}
            />
          ))}
        </div>
      )}
    </div>
  );
};
