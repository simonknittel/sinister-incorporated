import { env } from "./notification-router/setup"; // must be first

import type { SQSBatchItemFailure, SQSHandler } from "aws-lambda";
import { createApplicationContext } from "./common/createApplicationContext";
import { isRequestProcessed, setRequestProcessed } from "./common/dynamodb";
import { log } from "./common/logger";
import {
  bodySchema,
  notificationRouterHandler,
} from "./notification-router/handler";

const context = createApplicationContext({
  source: "notification-router",
  baseUrl: env.BASE_URL,
  publicUploadBaseUrl: env.PUBLIC_UPLOAD_BASE_URL,
});

export const handler: SQSHandler = async (event) => {
  // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
  const batchItemFailures: SQSBatchItemFailure[] = [];

  log.info("Processing SQS messages", {
    count: event.Records.length,
  });
  for (const record of event.Records) {
    try {
      const body = bodySchema.parse(JSON.parse(record.body));

      if (await isRequestProcessed(body.requestId)) continue;

      await notificationRouterHandler(context, body);

      await setRequestProcessed(body.requestId);
    } catch (error) {
      log.error("An error occurred while processing an SQS message", {
        error,
        messageId: record.messageId,
      });

      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
