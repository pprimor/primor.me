"use server";

import { Resend } from "resend";
import Email from "../components/contact/email";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

const validateFormField = (value: FormDataEntryValue | null) => {
  if (!value || typeof value !== "string" || value.length === 0) {
    return false;
  }
  return true;
};

const sendEmail = async (formData: FormData) => {
  const senderEmail = formData.get("senderEmail");
  const message = formData.get("message");

  if (!validateFormField(senderEmail) || !validateFormField(message)) {
    throw new Error("Invalid form data");
  }

  console.log("Sending email...");
  console.log("Sender email:", senderEmail);
  console.log("Message:", message);

  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "pedro.primor@pm.me",
    subject: "Message from contact form",
    reply_to: senderEmail as string,
    react: React.createElement(Email, {
      senderEmail: senderEmail as string,
      message: message as string,
    }),
  });
};

export default sendEmail;
