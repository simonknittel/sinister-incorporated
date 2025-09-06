import { authenticate } from "@/auth/server";
import { DefaultLayout } from "@/common/components/layouts/DefaultLayout";
import { getNavigationItems } from "@/iam/utils/getNavigationItems";
import { CreateRoleButton } from "@/roles/components/CreateRole/CreateRoleButton";
import type { ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default async function Layout({ children }: Props) {
  const [pages, authentication] = await Promise.all([
    getNavigationItems(),
    authenticate(),
  ]);

  const showCreateRoleButton =
    authentication && authentication.authorize("role", "manage");

  return (
    <DefaultLayout
      title="IAM"
      pages={pages}
      cta={showCreateRoleButton ? <CreateRoleButton /> : undefined}
    >
      {children}
    </DefaultLayout>
  );
}
