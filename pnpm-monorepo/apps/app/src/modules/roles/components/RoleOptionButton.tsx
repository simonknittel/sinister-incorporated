"use client";

import type { Role } from "@sam-monorepo/database/browser";
import { SingleRoleBadge } from "./SingleRoleBadge";

interface Props {
  readonly roleId: Role["id"];
  readonly onSelect: (roleId: Role["id"]) => void;
}

export const RoleOptionButton = ({ roleId, onSelect }: Props) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(roleId)}
      className="group cursor-pointer"
    >
      {/* The popover trigger of the badge would put a button into this button */}
      <SingleRoleBadge
        roleId={roleId}
        showPlaceholder
        withPopover={false}
        className="bg-transparent group-hover:bg-neutral-700/50 group-focus-visible:bg-neutral-700/50 group-active:bg-neutral-700/30"
      />
    </button>
  );
};
