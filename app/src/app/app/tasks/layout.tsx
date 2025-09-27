import { authenticate } from "@/modules/auth/server";
import { DefaultLayout } from "@/modules/common/components/layouts/DefaultLayout";
import { MaxWidthContent } from "@/modules/common/components/layouts/MaxWidthContent";
import { CreateTaskButton } from "@/modules/tasks/components/CreateTask/CreateTaskButton";
import { getNavigationItems } from "@/modules/tasks/utils/getNavigationItems";
import type { ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default async function Layout({ children }: Props) {
  const [pages, authentication] = await Promise.all([
    getNavigationItems(),
    authenticate(),
  ]);

  const showCreateTaskButton =
    authentication && authentication.authorize("task", "create");

  return (
    <DefaultLayout
      title="Tasks"
      pages={pages}
      cta={showCreateTaskButton ? <CreateTaskButton /> : undefined}
      slug="tasks"
    >
      <MaxWidthContent>{children}</MaxWidthContent>
    </DefaultLayout>
  );
}
