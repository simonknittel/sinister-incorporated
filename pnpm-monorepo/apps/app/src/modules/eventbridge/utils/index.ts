import { env } from "@/env";
import { log } from "@/modules/logging";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  createEventBridgeClient,
  createEventBridgeEmitter,
} from "@sam-monorepo/infrastructure";

const client =
  env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
    ? createEventBridgeClient({
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      })
    : null;

export const emitEvents = withTrace(
  "emitEvents",
  createEventBridgeEmitter({
    client,
    eventBusArn: env.AWS_EVENT_BUS_ARN,
    log,
  }),
);
