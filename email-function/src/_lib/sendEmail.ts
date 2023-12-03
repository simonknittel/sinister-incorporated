import formData from "form-data";
import Mailgun from "mailgun.js";

interface Props {
  html: string;
  mailgunApiKey: string;
  to: string;
}

export const sendEmail = async ({ html, mailgunApiKey, to }: Props) => {
  const mailgun = new Mailgun(formData);

  const mg = mailgun.client({
    username: "api",
    key: mailgunApiKey,
    url: "https://api.eu.mailgun.net",
  });

  await mg.messages.create("mailgun.simonknittel.de", {
    from: `Sinister Incorporated <noreply@mailgun.simonknittel.de>`,
    to,
    subject: "E-Mail-Adresse bestätigen | Sinister Incorporated",
    html,
  });
};
