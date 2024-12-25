import { env } from "@/env";
import { CustomError } from "@/logging/CustomError";
import {
  EventBridgeClient,
  PutEventsCommand,
  type PutEventsCommandInput,
} from "@aws-sdk/client-eventbridge";
import { createId } from "@paralleldrive/cuid2";
import { request } from "node:https";
import { serializeError } from "serialize-error";

export const sendEmailV1 = async (
  template: "emailConfirmation",
  messages: {
    to: string;
    templateProps: Record<string, string>;
  }[],
) => {
  return new Promise<void>((resolve, reject) => {
    if (!env.EMAIL_FUNCTION_ENDPOINT)
      throw new Error("EMAIL_FUNCTION_ENDPOINT is not set");

    const req = request(
      env.EMAIL_FUNCTION_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        key: env.API_CLIENT_KEY,
        cert: env.API_CLIENT_CERT,
        agent: false,
      },
      (res) => {
        let body = "";

        res.on("data", (d) => {
          body += d;
        });

        res.on("end", () => {
          if (
            !res.statusCode ||
            res.statusCode < 200 ||
            res.statusCode >= 300
          ) {
            reject(
              new CustomError("Email Function failed", {
                responseStatus: res.statusCode,
                responseBody: body,
              }),
            );
          }

          resolve();
        });
      },
    );

    req.on("error", (e) => {
      reject(
        new CustomError("Request to Email Function failed", {
          error: serializeError(e),
        }),
      );
    });

    req.write(
      JSON.stringify({
        requestId: createId(),
        template,
        messages,
      }),
    );

    req.end();
  });
};

export const sendEmailV2 = async (
  template: "emailConfirmation",
  messages: {
    to: string;
    templateProps: Record<string, string>;
  }[],
) => {
  if (
    !env.AWS_ACCESS_KEY_ID ||
    !env.AWS_SECRET_ACCESS_KEY ||
    !env.AWS_EVENT_BUS_ARN
  )
    throw new Error(
      "AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY or EVENT_BUS_ARN are missing",
    );

  try {
    // Reference: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/eventbridge/
    const client = new EventBridgeClient({
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
      region: "eu-central-1",
    });

    const input: PutEventsCommandInput = {
      Entries: [
        {
          Source: "App",
          DetailType: "EmailRequested",
          Detail: JSON.stringify({
            requestId: createId(),
            template,
            messages,
          }),
          EventBusName: env.AWS_EVENT_BUS_ARN,
        },
      ],
    };

    const command = new PutEventsCommand(input);

    const response = await client.send(command);

    if (response.FailedEntryCount) {
      throw new CustomError(
        "Failed to create EmailConfirmationRequested event",
        {
          response,
        },
      );
    }
  } catch (error) {
    throw new CustomError("Failed to create EmailConfirmationRequested event", {
      error,
    });
  }
};
