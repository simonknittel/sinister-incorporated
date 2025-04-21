"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { TaskSkeleton } from "./TaskSkeleton";

const ClosedTasksList = dynamic(
  () => import("./ClosedTasksList").then((mod) => mod.ClosedTasksList),
  { ssr: false, loading: () => <TaskSkeleton /> },
);

type Props = ComponentProps<typeof ClosedTasksList>;

export const ClosedTasksClient = (props: Props) => {
  return <ClosedTasksList {...props} />;
};
