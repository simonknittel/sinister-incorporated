"use server";

import { createUseCaseAction } from "@/modules/application";
import { unsubscribeWebPush as unsubscribeWebPushUseCase } from "@sam-monorepo/application";

export const unsubscribeWebPush = createUseCaseAction({
  name: "unsubscribeWebPush",
  useCase: unsubscribeWebPushUseCase,
  success: () => "Die Benachrichtigungen wurden auf allen Geräten deaktiviert.",
});
