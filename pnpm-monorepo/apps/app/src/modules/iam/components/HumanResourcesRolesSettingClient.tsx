"use client";

import { ActionErrorNote } from "@/modules/actions/components/ActionErrorNote";
import { useAction } from "@/modules/actions/utils/useAction";
import { SubmitButton } from "@/modules/common/components/SubmitButton";
import { RolesPicker } from "@/modules/roles/components/RolesPicker";
import type { Role } from "@sam-monorepo/database/browser";
import { MAX_HUMAN_RESOURCES_ROLES } from "@sam-monorepo/domain";
import { FaSave } from "react-icons/fa";
import { updateHumanResourcesRoles } from "../actions/updateHumanResourcesRoles";

interface Props {
  readonly defaultRoleIds: readonly Role["id"][];
}

export const HumanResourcesRolesSettingClient = ({ defaultRoleIds }: Props) => {
  const { state, formAction } = useAction(updateHumanResourcesRoles, {
    errorToast: false,
  });

  return (
    <form action={formAction}>
      <RolesPicker
        name="roleId"
        label="Rollen"
        helpText={`Maximal ${MAX_HUMAN_RESOURCES_ROLES} Rollen sind möglich.`}
        defaultValue={defaultRoleIds}
      />

      <SubmitButton icon={<FaSave />} className="mt-4 ml-auto">
        Speichern
      </SubmitButton>

      <ActionErrorNote className="mt-4" state={state} />
    </form>
  );
};
