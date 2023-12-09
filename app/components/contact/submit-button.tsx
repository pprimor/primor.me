import React from "react";
import { FaPaperPlane } from "react-icons/fa";
// import { experimental_useFormStatus as useFormStatus } from "react-dom";

export default function SubmitButton() {
  // const { pending } = useFormStatus();
  const pending = false;
  return (
    <button
      type="submit"
      className="group flex items-center justify-center gap-2 h-[3rem] w-[8rem] bg-gray-900 dark:bg-white dark:bg-opacity-10 text-white rounded-full outline-none transition-all focus:scale-110 hover:scale-110 hover:bg-gray-950 active:scale-105 disabled:scale-100 disabled:bg-opacity-65"
      disabled={pending}
    >
      {pending ? (
        <div className="w-5 h-5 animate-spin rounded-full border-b-2 border-white" />
      ) : (
        <>
          Submit{" "}
          <FaPaperPlane className="text-xs opacity-70 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />{" "}
        </>
      )}
    </button>
  );
}