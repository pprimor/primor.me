import "../globals.css";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import ContactForm, { FORM_PROPS_ID, FORM_ROOT_ID, type ContactFormProps } from "./ContactForm";

const root = document.getElementById(FORM_ROOT_ID);
const propsJson = document.getElementById(FORM_PROPS_ID)?.textContent;

if (root && propsJson) {
  const props = JSON.parse(propsJson) as ContactFormProps;
  hydrateRoot(
    root,
    <StrictMode>
      <ContactForm {...props} />
    </StrictMode>,
  );
}
