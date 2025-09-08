import { authenticate } from "@/auth/server";
import { DefaultLayout } from "@/common/components/layouts/DefaultLayout";
import { CreateTaskButton } from "@/tasks/components/CreateTask/CreateTaskButton";
import { getNavigationItems } from "@/tasks/utils/getNavigationItems";
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
      {children}
    </DefaultLayout>
  );
}
