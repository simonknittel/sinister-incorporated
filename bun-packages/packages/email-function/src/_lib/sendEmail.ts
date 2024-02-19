import formData from "form-data";
import Mailgun from "mailgun.js";

export const sendEmail = async (
	mailgunApiKey: string,
	to: string,
	subject: string,
	body: string,
	options?: { format?: "text" },
) => {
	const mailgun = new Mailgun(formData);

	const mg = mailgun.client({
		username: "api",
		key: mailgunApiKey,
		url: "https://api.eu.mailgun.net",
	});

	if (options?.format === "text") {
		await mg.messages.create("mailgun.simonknittel.de", {
			from: "Sinister Incorporated <noreply@mailgun.simonknittel.de>",
			to,
			subject,
			text: body,
		});
	} else {
		await mg.messages.create("mailgun.simonknittel.de", {
			from: "Sinister Incorporated <noreply@mailgun.simonknittel.de>",
			to,
			subject,
			html: body,
		});
	}
};
