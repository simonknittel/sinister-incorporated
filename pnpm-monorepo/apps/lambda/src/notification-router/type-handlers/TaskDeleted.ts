import {
  findTaskDeletedRecipients,
  type ApplicationContext,
} from "@sam-monorepo/application";
import { type Task } from "@sam-monorepo/database";
import { publishNotifications } from "../publish";

interface Payload {
  taskId: Task["id"];
}

export const TaskDeletedHandler = async (
  context: ApplicationContext,
  payload: Payload,
) => {
  const result = await findTaskDeletedRecipients(context, {
    taskId: payload.taskId,
  });
  if (!result) return;

  await publishNotifications(
    context,
    result.recipients.map((recipient) => ({
      receiverId: recipient.citizenId,
      notificationType: "task_deleted" as const,
      payload: { taskTitle: result.task.title },
      title: "Task gelöscht",
      body: result.task.title,
    })),
  );
};
