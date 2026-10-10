import MockButton from "./MockButton";

const bars = ["70%", "100%", "100%", "80%", "100%", "60%"];

function Comment({ who, text, active = false }: { who: string; text: string; active?: boolean }) {
  return (
    <span
      className="block border-l-[3px] pl-2 text-[11px] leading-snug"
      style={{ borderColor: active ? "var(--host-accent)" : "var(--host-border)" }}
    >
      <span className="block font-semibold">{who}</span>
      {text}
    </span>
  );
}

export default function WordPanel() {
  return (
    <div className="flex h-full bg-[var(--host-surface)] text-[var(--host-text)]">
      <div className="flex min-w-0 flex-1 bg-[var(--host-raised)] p-3">
        <div className="flex flex-1 flex-col gap-2 bg-[var(--host-surface)] p-4">
          {bars.map((width, i) => (
            <span
              key={i}
              className="block"
              style={{
                width,
                height: i === 0 ? 10 : 6,
                background: i === 0 ? "var(--host-text)" : "var(--host-border)",
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex w-44 shrink-0 flex-col gap-2.5 border-l border-[var(--host-border)] p-3">
        <span className="text-[13px] font-semibold">PageProof</span>
        <Comment who="Legal" text="Add the trademark mark here." active />
        <Comment who="Marketing" text="Shorter headline?" />
        <div className="mt-auto">
          <MockButton block>Upload new version</MockButton>
        </div>
      </div>
    </div>
  );
}
