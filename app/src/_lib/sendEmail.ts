import { createId } from "@paralleldrive/cuid2";
import https from "node:https";
import { serializeError } from "serialize-error";
import { env } from "../env.mjs";
import { CustomError } from "./logging/CustomError";

export const sendEmail = async (
  template: "emailConfirmation",
  messages: {
    to: string;
    templateProps: Record<string, string>;
  }[],
) => {
  if (!env.EMAIL_FUNCTION_ENDPOINT)
    throw new Error("EMAIL_FUNCTION_ENDPOINT is not set");

  return new Promise<void>((resolve, reject) => {
    const req = https.request(
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
