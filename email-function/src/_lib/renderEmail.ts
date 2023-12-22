import { render } from "@react-email/render";
import Email, {
  type EmailConfirmationProps,
} from "../../../emails/emails/EmailConfirmation";
import { CustomError } from "./logging/CustomError";
import { TemplateType } from "./types";

export const renderEmail = (template: TemplateType, templateProps: EmailConfirmationProps, options?: { format?: "text" }) => {
  switch (template) {
    case "emailConfirmation":
      return options?.format === "text" ? emailConfirmationText(templateProps) : render(Email(templateProps));

    default:
      throw new CustomError("Invalid template", { template });
  }
};

const emailConfirmationText = ({ baseUrl, token }: EmailConfirmationProps) => {
  const host = baseUrl.replace(/^https?:\/\//, "");

  return `E-Mail-Adresse bestätigen - Sinister Inc

Deine E-Mail-Adresse muss bestätigt werden bevor du ${host} nutzen kannst.

Öffne folgenden Link in deinem Browser um deine E-Mail-Adresse zu bestätigen:
${baseUrl}/confirm-email?token=${token}

Falls du diese E-Mail nicht erwartet hast, melde dich bei info@sinister-incorporated.de.

---

Impressum: ${baseUrl}/imprint
Datenschutzerklärung: ${baseUrl}/privacy-policy
`
};
