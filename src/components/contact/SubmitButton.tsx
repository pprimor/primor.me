import React from "react";
import { FaPaperPlane } from "react-icons/fa";

type SubmitButtonProps = {
  isSubmitting: boolean;
};

export default function SubmitButton({ isSubmitting }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className="group flex items-center justify-center gap-2 h-[3rem] w-[8rem] bg-gray-900 dark:bg-white dark:bg-opacity-10 text-white rounded-full outline-none transition-all focus:scale-110 hover:scale-110 hover:bg-gray-950 active:scale-105 disabled:scale-100 disabled:bg-opacity-65"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
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
