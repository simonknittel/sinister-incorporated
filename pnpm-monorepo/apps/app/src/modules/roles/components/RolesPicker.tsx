"use client";

import { Button2, Button2Variant } from "@/modules/common/components/Button2";
import { PopoverBaseUI } from "@/modules/common/components/PopoverBaseUI";
import type { Role } from "@sam-monorepo/database/browser";
import { useState, type ReactNode } from "react";
import { FaTrash, FaUsers } from "react-icons/fa";
import { useRolesContext } from "./RolesContext";
import { SingleRoleBadge } from "./SingleRoleBadge";

interface Props {
  readonly className?: string;
  /** The roles that the user can select. The picker sorts them by name. */
  readonly roles: readonly Pick<Role, "id" | "name">[];
  /** The form field name of the hidden input of each selected role */
  readonly name: string;
  readonly label: string;
  readonly helpText?: ReactNode;
  readonly defaultValue?: readonly Role["id"][];
  /** When true, the user cannot add or remove a role */
  readonly disabled?: boolean;
}

/**
 * Submits one hidden input for each selected role. A selected role that the
 * viewer cannot see shows as a placeholder and is still submitted, because a
 * save without it would remove it from the record.
 */
export const RolesPicker = ({
  className,
  roles,
  name,
  label,
  helpText,
  defaultValue,
  disabled = false,
}: Props) => {
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
            disabled={disabled}
          />
        }
        openOnHover={false}
        positionerClassName="z-40"
        childrenClassName="max-h-96 overflow-auto"
      >
        <div className="flex flex-col gap-2">
          {roles
            .toSorted((first, second) => first.name.localeCompare(second.name))
            .map((role) => (
              <RoleOption
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
            <SelectedRole
              key={roleId}
              roleId={roleId}
              name={name}
              disabled={disabled}
              onRemove={removeRole}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface RoleOptionProps {
  readonly roleId: Role["id"];
  readonly onSelect: (roleId: Role["id"]) => void;
}

const RoleOption = ({ roleId, onSelect }: RoleOptionProps) => {
  return (
    <button type="button" onClick={() => onSelect(roleId)} className="group">
      <SingleRoleBadge
        roleId={roleId}
        showPlaceholder
        withPopover={false}
        className="bg-transparent group-hover:bg-neutral-700/50 group-focus-visible:bg-neutral-700/50 group-active:bg-neutral-700/30"
      />
    </button>
  );
};

interface SelectedRoleProps {
  readonly roleId: Role["id"];
  readonly name: string;
  readonly disabled: boolean;
  readonly onRemove: (roleId: Role["id"]) => void;
}

const SelectedRole = ({
  roleId,
  name,
  disabled,
  onRemove,
}: SelectedRoleProps) => {
  const { roles } = useRolesContext();
  const isVisible = roles.some((role) => role.id === roleId);

  return (
    <div>
      <button
        type="button"
        onClick={() => onRemove(roleId)}
        disabled={disabled}
        title="Rolle entfernen"
        className="group flex items-center gap-1 rounded-secondary bg-neutral-700/50 pr-2 hover:bg-neutral-700/70 focus-visible:bg-neutral-700/70 active:bg-neutral-700/40 disabled:opacity-50"
      >
        {isVisible ? (
          <SingleRoleBadge
            className="bg-transparent"
            roleId={roleId}
            showPlaceholder
            withPopover={false}
          />
        ) : (
          <span
            className="inline-flex h-8 items-center px-2 text-neutral-500"
            title="Diese Rolle ist ausgewählt, du darfst sie aber nicht sehen."
          >
            Verborgene Rolle
          </span>
        )}
        <FaTrash className="flex-none text-brand-red-500 group-hover:text-brand-red-300 group-focus-visible:text-brand-red-300 group-active:text-brand-red-700" />
      </button>

      <input type="hidden" name={name} value={roleId} />
    </div>
  );
};
