"use client";

import type { Role } from "@sam-monorepo/database/browser";
import { FaTrash } from "react-icons/fa";
import { useRolesContext } from "./RolesContext";
import { SingleRoleBadge } from "./SingleRoleBadge";

interface Props {
  readonly roleId: Role["id"];
  /** The form field name of the hidden input */
  readonly name: string;
  readonly onRemove: (roleId: Role["id"]) => void;
}

/**
 * A selected role that the viewer cannot see shows as a placeholder and is
 * still submitted, because a save without it would remove it from the record.
 */
export const SelectedRoleBadge = ({ roleId, name, onRemove }: Props) => {
  const { roles } = useRolesContext();
  const isVisible = roles.some((role) => role.id === roleId);

  return (
    <div>
      <button
        type="button"
        onClick={() => onRemove(roleId)}
        title="Rolle entfernen"
        className="group flex cursor-pointer items-center gap-1 rounded-secondary bg-neutral-700/50 pr-2 hover:bg-neutral-700/70 focus-visible:bg-neutral-700/70 active:bg-neutral-700/40"
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
