import MockButton from "./MockButton";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col gap-1 text-xs">
      <span>{label}</span>
      <span className="flex h-9 items-center rounded-[var(--host-radius)] border border-[var(--host-border)] px-2.5 text-[13px]">
        {value}
      </span>
    </span>
  );
}

export default function CanvaPanel() {
  return (
    <div className="flex h-full flex-col gap-3 bg-[var(--host-surface)] p-4 text-[var(--host-text)]">
      <span className="text-[15px] font-semibold">Send for review</span>
      <Field label="Reviewers" value="marketing@, legal@" />
      <Field label="Due" value="Fri 16 Oct" />
      <span className="text-[11px] text-[var(--host-muted)]">
        Reviewers get a link to comment on this design.
      </span>
      <div className="mt-auto">
        <MockButton block>Create proof</MockButton>
      </div>
    </div>
  );
}
