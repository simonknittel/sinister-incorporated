"use client";

import { useAction } from "@/actions/utils/useAction";
import YesNoCheckbox from "@/common/components/form/YesNoCheckbox";
import type { ChangeEventHandler } from "react";
import { updateSingleRolePermission } from "../actions/updateSingleRolePermission";
import type { getRoles } from "../queries";
import type { PERMISSIONS } from "./PermissionMatrix";
import { usePermissionsContext } from "./PermissionsContext";

interface Props {
  readonly role: Awaited<ReturnType<typeof getRoles>>[number];
  readonly permission: (typeof PERMISSIONS)[number];
}

export const PermissionCheckbox = ({ role, permission }: Props) => {
  const { permissionStrings } = usePermissionsContext();
  const { formAction } = useAction(updateSingleRolePermission);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const form = event.currentTarget.form;
    if (!form) return;
    form.requestSubmit();
  };

  return (
    <td>
      <form action={formAction}>
        <input type="hidden" name="roleId" value={role.id} />
        <input
          type="hidden"
          name="permissionString"
          value={permission.string}
        />

        <YesNoCheckbox
          name="checked"
          defaultChecked={permissionStrings.includes(permission.string)}
          yesLabel=""
          noLabel=""
          onChange={handleChange}
        />
      </form>
    </td>
  );
};
