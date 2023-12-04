import { EmailConfirmationProps } from "../../../emails/emails/EmailConfirmation";
import { CustomError } from "./logging/CustomError";
import { renderEmail } from "./renderEmail";
import { sendEmail } from "./sendEmail";

interface Props {
  mailgunApiKey: string;
  to: string;
  template: "emailConfirmation";
  templateProps: EmailConfirmationProps;
}

export const foo = async ({
  mailgunApiKey,
  to,
  template,
  templateProps,
}: Props) => {
  const html = renderEmail({
    template,
    templateProps,
  });

  let subject: string;
  switch (template) {
    case "emailConfirmation":
      subject = "E-Mail-Adresse bestätigen | Sinister Incorporated";
      break;

    default:
      throw new CustomError("Invalid template", { template });
  }

  await sendEmail({
    mailgunApiKey,
    to,
    subject,
    html,
  });
};
