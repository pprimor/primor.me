export default function NotFound() {
  const path = typeof window === "undefined" ? "" : window.location.pathname;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 font-mono text-base leading-relaxed sm:px-8 sm:py-10 sm:text-[15px]">
      <h1 className="sr-only">Page not found</h1>
      <p className="whitespace-pre-wrap break-words">
        <span className="text-term-accent">guest@primor.me:~$</span> cd {path}
      </p>
      <p className="whitespace-pre-wrap break-words text-term-error">
        bash: cd: {path}: No such file or directory
      </p>
      <p className="mt-4">
        <a
          href="/"
          className="text-term-link underline decoration-term-muted underline-offset-4 hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-term-fg"
        >
          cd ~
        </a>
      </p>
    </main>
  );
}
