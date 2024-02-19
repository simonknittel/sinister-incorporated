import { EmailConfirmationProps } from "../../../emails/emails/EmailConfirmation";
import { encryptText } from "./encryptText";
import { getSubject } from "./getSubject";
import { renderEmail } from "./renderEmail";
import { sendEmail } from "./sendEmail";
import { TemplateType } from "./types";

interface Props {
	mailgunApiKey: string;
	to: string;
	template: TemplateType;
	templateProps: EmailConfirmationProps;
	recipientsPublicKey?: string;
}

export const main = async ({
	mailgunApiKey,
	to,
	template,
	templateProps,
	recipientsPublicKey,
}: Props) => {
	const subject = getSubject(template);

	if (recipientsPublicKey) {
		let body = renderEmail(template, templateProps, { format: "text" });

		body = await encryptText(body, recipientsPublicKey);

		await sendEmail(mailgunApiKey, to, subject, body, { format: "text" });
	} else {
		const body = renderEmail(template, templateProps);

		await sendEmail(mailgunApiKey, to, subject, body);
	}
};
