"use server";

import { createUseCaseAction } from "@/modules/application";
import { unsubscribeWebPush as unsubscribeWebPushUseCase } from "@sam-monorepo/application";
import * as z from "zod";

const schema = z.object({});

export const unsubscribeWebPush = createUseCaseAction({
  name: "unsubscribeWebPush",
  schema,
  useCase: unsubscribeWebPushUseCase,
  success: () => "Die Benachrichtigungen wurden auf allen Geräten deaktiviert.",
});
