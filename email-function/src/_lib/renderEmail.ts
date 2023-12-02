import { render } from "@react-email/render";
import Email, {
  type EmailConfirmationProps,
} from "../../../emails/emails/EmailConfirmation";

export const renderEmail = (props: EmailConfirmationProps) => {
  return render(Email(props));
};
