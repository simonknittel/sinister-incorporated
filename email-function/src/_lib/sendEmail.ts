import Mailgun from "mailgun.js";

interface Props {
  html: string;
  mailgunApiKey: string;
}

export const sendEmail = async ({ html, mailgunApiKey }: Props) => {
  // const mailgun = new Mailgun(formData);

  // const mg = mailgun.client({
  //   username: "api",
  //   key: mailgunApiKey,
  //   url: "https://api.eu.mailgun.net",
  // });

  // await mg.messages.create(mailgunDomain, {
  //   from: `Sinister Incorporated <noreply@${mailgunDomain}>`,
  //   to,
  //   subject: "You have been invited to a project | Link Portal",
  //   template: "invite_link-portal",
  //   "h:X-Mailgun-Variables": JSON.stringify({
  //     inviteeName: invitee.name,
  //     inviteeEmail: invitee.email,
  //     projectName: project.name,
  //     target: env.NEXTAUTH_URL,
  //   }),
  // });
};
