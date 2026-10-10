/** Debian's default colour PS1: bold green user@host, bold blue path. */
export default function Prompt() {
  return (
    <span>
      <b className="text-term-accent">guest@primor.me</b>:<b className="text-term-path">~</b>$
    </span>
  );
}
