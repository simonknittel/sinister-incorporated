import formData from "form-data";
import Mailgun from "mailgun.js";

interface Props {
  mailgunApiKey: string;
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({
  mailgunApiKey,
  to,
  subject,
  html,
}: Props) => {
  const mailgun = new Mailgun(formData);

  const mg = mailgun.client({
    username: "api",
    key: mailgunApiKey,
    url: "https://api.eu.mailgun.net",
  });

  await mg.messages.create("mailgun.simonknittel.de", {
    from: `Sinister Incorporated <noreply@mailgun.simonknittel.de>`,
    to,
    subject,
    html,
  });
};
