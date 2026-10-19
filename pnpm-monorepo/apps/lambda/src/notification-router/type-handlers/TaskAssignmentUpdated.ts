import {
  findTaskAssignmentRecipients,
  type ApplicationContext,
} from "@sam-monorepo/application";
import { type Task } from "@sam-monorepo/database";
import { publishNotifications } from "../publish";

interface Payload {
  taskId: Task["id"];
}

export const TaskAssignmentUpdatedHandler = async (
  context: ApplicationContext,
  payload: Payload,
) => {
  const result = await findTaskAssignmentRecipients(context, {
    taskId: payload.taskId,
  });
  if (!result) return;

  await publishNotifications(
    context,
    result.recipients.map((recipient) => ({
      receiverId: recipient.citizenId,
      notificationType: "task_assignment_updated" as const,
      payload: { taskId: result.task.id, taskTitle: result.task.title },
      title: "Neuer Task",
      body: `Dir wurde ein Task zugewiesen: ${result.task.title}`,
      url: `/app/tasks/${result.task.id}`,
    })),
  );
};
