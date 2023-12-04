import { foo } from "./_lib/foo";
import { log } from "./_lib/logging";
import "dotenv/config";

const config = {
  mailgunApiKey: process.env.MAILGUN_API_KEY!,
  to: "hallo@simonknittel.de",
  template: "emailConfirmation",
  templateProps: {
    baseUrl: "http://localhost:3000",
    token: "1234567890",
  },
} as const;

const main = async () => {
  if (!config.mailgunApiKey) throw new Error("Missing Mailgun API key");

  await foo(config);

  log.info("Done");
};

main()
  .then(() => {})
  .catch((error) => {
    log.error("Error", {
      error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });

    process.exit(1);
  });
