import formData from "form-data";
import Mailgun from "mailgun.js";
import { CustomError } from "./logging/CustomError";
import { emailConfirmation } from "./templates/emailConfirmation";

interface Props {
	mailgunApiKey: string;
	template: string;
	messages: Array<{
		to: string;
		templateProps: Record<string, string>;
		recipientsPublicKey?: string;
	}>;
}

export const main = async ({ mailgunApiKey, template, messages }: Props) => {
	const mailgun = new Mailgun(formData);

	const mg = mailgun.client({
		username: "api",
		key: mailgunApiKey,
		url: "https://api.eu.mailgun.net",
	});

	switch (template) {
		case "emailConfirmation":
			await emailConfirmation(mg, messages);
			break;

		default:
			throw new CustomError("Invalid template", { template });
	}
};
