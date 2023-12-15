"use client";

import { Resend } from "resend";
import Email from "../components/contact/email";
import React from "react";
import { ContactFormData } from "../components/contact/contact";

const validateFormField = (value: string | null) => {
  if (!value || typeof value !== "string" || value.length === 0) {
    return false;
  }
  return true;
};

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (formData: ContactFormData) => {
  const { senderEmail, message } = formData;

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
    reply_to: senderEmail,
    react: React.createElement(Email, {
      senderEmail: senderEmail,
      message: message,
    }),
  });
};

export default sendEmail;
