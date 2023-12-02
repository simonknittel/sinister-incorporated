import { type EmailConfirmationProps } from "../../emails/emails/EmailConfirmation";
import { log } from "./_lib/logging";
import { renderEmail } from "./_lib/renderEmail";
import { sendEmail } from "./_lib/sendEmail";
import "dotenv/config";

const testProps: EmailConfirmationProps = {
  baseUrl: "http://localhost:3000",
  contactEmailAddress: "info@sinister-incorporated.de",
  token: "1234567890",
} as const;

const main = async () => {
  const html = renderEmail(testProps);
  await sendEmail(html);
};

main()
  .then(() => {})
  .catch((error) => {
    log.error("Error", {
      error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });

    process.exit(1);
  });
