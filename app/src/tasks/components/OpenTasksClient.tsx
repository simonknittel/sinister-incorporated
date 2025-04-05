"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { TaskSkeleton } from "./TaskSkeleton";

const OpenTasksList = dynamic(
  () => import("./OpenTasksList").then((mod) => mod.OpenTasksList),
  { ssr: false, loading: () => <TaskSkeleton /> },
);

type Props = ComponentProps<typeof OpenTasksList>;

export const OpenTasksClient = (props: Props) => {
  return <OpenTasksList {...props} />;
};
