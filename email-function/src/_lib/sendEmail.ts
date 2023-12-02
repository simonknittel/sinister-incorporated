import Mailgun from "mailgun.js";

export const sendEmail = async (html: string) => {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    throw new Error("Missing MAILGUN_API_KEY or MAILGUN_DOMAIN");
  }

  console.log("sendEmail()");

  // const mailgun = new Mailgun(formData);

  // const mg = mailgun.client({
  //   username: "api",
  //   key: env.MAILGUN_API_KEY,
  //   url: "https://api.eu.mailgun.net",
  // });

  // await mg.messages.create(env.MAILGUN_DOMAIN, {
  //   from: `Link Portal <noreply@${env.MAILGUN_DOMAIN}>`,
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
