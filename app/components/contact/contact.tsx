"use client";

import React from "react";
import SectionHeading from "../section-heading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import sendEmail from "../../server/sendEmail";
import SubmitButton from "./submit-button";
import toast from "react-hot-toast";

export default function Contact() {
  const { ref } = useSectionInView("#contact");
  return (
    <motion.section
      id="contact"
      className="mb-20 sm:mb-28 w-[min(100%,38rem)] text-center"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
      ref={ref}
    >
      <SectionHeading>Contact me</SectionHeading>
      <p className="text-gray-700 dark:text-gray-300">
        Please contact me directly at{" "}
        <a className="underline" href="mailto:pedro.primor@pm.me">
          pedro.primor@pm.me
        </a>{" "}
        or through this form.
      </p>
      <form
        className="flex flex-col mt-10"
        action={async (formData) => {
          const { data, error } = await sendEmail(formData);
          if (data) {
            toast.success("Message sent successfully!");
          }
          if (error) {
            toast.error(error.message);
          }
        }}
      >
        <input
          type="email"
          name="senderEmail"
          className="h-14 px-4 rounded-lg borderBlack dark:bg-white dark:bg-opacity-90 dark:focus:bg-opacity-100 transition-all dark:outline-none text-black"
          placeholder="Your email"
          required
          maxLength={320}
        />
        <textarea
          name="message"
          className="h-52 my-3 p-4 rounded-lg borderBlack dark:border-white dark:bg-white dark:bg-opacity-90 dark:focus:bg-opacity-100 transition-all dark:outline-none text-black"
          placeholder="Your message"
          required
          maxLength={1000}
        />
        <SubmitButton />
      </form>
    </motion.section>
  );
}
