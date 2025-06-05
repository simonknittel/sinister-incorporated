"use client";

import { useAction } from "@/actions/utils/useAction";
import YesNoCheckbox from "@/common/components/form/YesNoCheckbox";
import type { Role } from "@prisma/client";
import { memo, type ChangeEventHandler } from "react";
import { updateSingleRolePermission } from "../actions/updateSingleRolePermission";
import { usePermissionsContext } from "./PermissionsContext";

interface Props {
  readonly roleId: Role["id"];
  readonly permissionString: string;
}

export const PermissionCheckbox = memo(function PermissionCheckbox({
  roleId,
  permissionString,
}: Props) {
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
        <input type="hidden" name="roleId" value={roleId} />
        <input type="hidden" name="permissionString" value={permissionString} />

        <YesNoCheckbox
          name="checked"
          defaultChecked={permissionStrings.includes(permissionString)}
          yesLabel=""
          noLabel=""
          onChange={handleChange}
        />
      </form>
    </td>
  );
});
