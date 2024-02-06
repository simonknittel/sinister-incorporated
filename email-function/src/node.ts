import { main } from "./_lib/main";
import { log } from "./_lib/logging";
import "dotenv/config";
import { serializeError } from "serialize-error";

const config = {
  mailgunApiKey: process.env.MAILGUN_API_KEY!,
  to: "hallo@simonknittel.de",
  template: "emailConfirmation",
  templateProps: {
    baseUrl: "http://localhost:3000",
    token: "1234567890",
  },
} as const;

const init = async () => {
  if (!config.mailgunApiKey) throw new Error("Missing Mailgun API key");

  await main(config);

  log.info("Done");
};

init()
  .then(() => { })
  .catch((error) => {
    log.error(error.message, serializeError(error));

    process.exit(1);
  });
