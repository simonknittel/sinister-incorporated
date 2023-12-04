import { render } from "@react-email/render";
import Email, {
  type EmailConfirmationProps,
} from "../../../emails/emails/EmailConfirmation";
import { CustomError } from "./logging/CustomError";

interface Props {
  template: "emailConfirmation";
  templateProps: EmailConfirmationProps;
}

export const renderEmail = ({ template, templateProps }: Props) => {
  switch (template) {
    case "emailConfirmation":
      return render(Email(templateProps));

    default:
      throw new CustomError("Invalid template", { template });
  }
};
