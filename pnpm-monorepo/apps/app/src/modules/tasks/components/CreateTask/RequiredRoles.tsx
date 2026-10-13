import { RolesPicker } from "@/modules/roles/components/RolesPicker";
import { api } from "@/trpc/react";
import type { Role } from "@sam-monorepo/database/browser";

interface Props {
  readonly className?: string;
  readonly defaultValue?: readonly Role["id"][];
}

export const RequiredRoles = ({ className, defaultValue }: Props) => {
  const { isPending, data } = api.roles.getVisibleRoles.useQuery(undefined);

  return (
    <RolesPicker
      className={className}
      roles={data ?? []}
      name="requiredRole[]"
      label="Erforderliche Rolle(n)"
      helpText="Dieser Task kann nur von den ausgewählten Rollen angenommen werden. optional"
      defaultValue={defaultValue}
      disabled={isPending}
    />
  );
};
