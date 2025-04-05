import type { ComponentProps } from "react";
import { isAllowedToManageTask } from "../utils/isAllowedToManageTask";
import { isTaskUpdatable } from "../utils/isTaskUpdatable";
import { TaskClient } from "./TaskClient";

type Props = ComponentProps<typeof TaskClient>;

export const TaskServer = async (props: Props) => {
  const { task, ...rest } = props;

  const showActions =
    isTaskUpdatable(task) && (await isAllowedToManageTask(task));

  return <TaskClient task={task} showActions={showActions} {...rest} />;
};
