import React from "react";

export default function Footer() {
  return (
    <footer className="text-center mt-28 mb-10">
      <small className="text-gray-700">
        Made with{" "}
        <span role="img" aria-label="heart">
          ❤️
        </span>{" "}
        by Pedro Primor
      </small>
      <br />
      <small className="text-gray-700 text-xs">
        <a
          className="underline"
          href="https://github.com/pprimor/primor.me"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>{" "}
        available on GitHub
      </small>
    </footer>
  );
}
