import MockButton from "./MockButton";

export default function JiraPanel() {
  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden bg-[var(--host-surface)] p-4 text-[var(--host-text)]">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-[var(--host-muted)]">DES-142</span>
        <span className="text-lg font-semibold leading-tight">Spring campaign hero banner</span>
      </div>
      <div className="flex items-center gap-3 rounded-[var(--host-radius)] border border-[var(--host-border)] p-3">
        <span className="grid h-[54px] w-[72px] shrink-0 place-items-center rounded-[var(--host-radius)] bg-[var(--host-raised)] text-[10px] text-[var(--host-muted)]">
          proof
        </span>
        <span className="flex min-w-0 flex-col gap-1 text-[11px]">
          <span className="text-xs font-semibold">PageProof · Spring hero v3</span>
          <span className="text-[var(--host-positive)]">Approved — 3 of 3 reviewers</span>
          <span className="text-[var(--host-muted)]">Approved file attached to this issue</span>
        </span>
      </div>
      <div className="flex gap-2">
        <MockButton>Open proof</MockButton>
        <MockButton variant="secondary">Link another</MockButton>
      </div>
    </div>
  );
}
