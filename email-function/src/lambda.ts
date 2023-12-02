import { type Handler } from "aws-lambda";
import { renderEmail } from "./_lib/renderEmail";
import { sendEmail } from "./_lib/sendEmail";
import z from "zod";
import errorHandler from "./_lib/errorHandler";

export const handler: Handler = async (event, context) => {
  try {
    if (event.httpMethod !== "POST") throw new Error("Bad request");

    const requestBody = JSON.parse(event.body);
    const body = postBodySchema.parse(requestBody);

    const html = renderEmail(body);
    await sendEmail(html);

    return {
      statusCode: 204,
    };
  } catch (error) {
    return errorHandler(error);
  }
};

const postBodySchema = z.object({
  baseUrl: z.string().url(),
  contactEmailAddress: z.string().email(),
  token: z.string(),
});
