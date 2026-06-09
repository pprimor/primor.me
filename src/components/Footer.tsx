export default function Footer() {
  return (
    <footer className="text-center sm:mt-28 sm:mb-10">
      <small className="text-gray-700 dark:text-gray-300">
        © {new Date().getFullYear()} Pedro Primor
      </small>
      <br />
      <small className="text-gray-700 text-xs dark:text-gray-300">
        <a
          className="underline"
          href="https://github.com/pprimor/primor.me"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source on GitHub
        </a>
      </small>
    </footer>
  );
}
