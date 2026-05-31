import { render } from "@react-email/render";
import ContactEmail from "./email";

export async function renderContactEmailHtml(
  senderEmail: string,
  message: string
): Promise<string> {
  return render(
    <ContactEmail senderEmail={senderEmail} message={message} />
  );
}
