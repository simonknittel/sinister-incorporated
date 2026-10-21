import {
  createEventBridgeClient,
  createEventBridgeEmitter,
} from "@sam-monorepo/infrastructure";
import { log } from "./logger";

export const emitEventsOrThrow = createEventBridgeEmitter({
  client: createEventBridgeClient(),
  eventBusArn: process.env.AWS_EVENT_BUS_ARN,
  log,
});
