import MockButton from "./MockButton";
import Pill, { type PillTone } from "./Pill";

const proofs: { name: string; status: string; tone: PillTone }[] = [
  { name: "Spring hero — v3", status: "Approved", tone: "positive" },
  { name: "Retail banner 728×90", status: "Changes requested · 4", tone: "notice" },
  { name: "Social square — v1", status: "In review", tone: "info" },
];

export default function PhotoshopPanel() {
  return (
    <div className="flex h-full flex-col bg-[var(--host-surface)] text-[var(--host-text)]">
      <div className="flex gap-4 border-b border-[var(--host-border)] px-3 pt-2 text-[11px]">
        <span className="border-b-2 border-[var(--host-text)] pb-2">Proofs</span>
        <span className="pb-2 text-[var(--host-muted)]">Comments</span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-3">
        {proofs.map((p) => (
          <li
            key={p.name}
            className="flex flex-col items-start gap-1.5 rounded-[var(--host-radius)] bg-[var(--host-raised)] p-2.5"
          >
            <span className="text-xs">{p.name}</span>
            <Pill tone={p.tone}>{p.status}</Pill>
          </li>
        ))}
      </ul>
      <div className="mt-auto p-3">
        <MockButton block>Create proof from document</MockButton>
      </div>
    </div>
  );
}
