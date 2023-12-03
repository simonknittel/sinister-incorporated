import { log } from "./_lib/logging";
import { renderEmail } from "./_lib/renderEmail";
import { sendEmail } from "./_lib/sendEmail";
import "dotenv/config";

const config = {
  baseUrl: "http://localhost:3000",
  contactEmailAddress: "info@sinister-incorporated.de",
  token: "1234567890",
  mailgunApiKey: process.env.MAILGUN_API_KEY,
  to: "hallo@simonknittel.de",
} as const;

const main = async () => {
  if (!config.mailgunApiKey) throw new Error("Missing Mailgun API key");

  const html = renderEmail({
    baseUrl: config.baseUrl,
    contactEmailAddress: config.contactEmailAddress,
    token: config.token,
  });

  await sendEmail({
    html,
    mailgunApiKey: config.mailgunApiKey,
    to: config.to,
  });
};

main()
  .then(() => {})
  .catch((error) => {
    log.error("Error", {
      error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });

    process.exit(1);
  });
