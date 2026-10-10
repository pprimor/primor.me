import { integrations } from "../lib/data";
import { siteMetadata } from "../lib/site-metadata";

const hosts = integrations.map((i) => i.host).join(" · ");
const hasServices = integrations.some((i) => i.service);
const linkButton = "x11-button inline-flex h-7 items-center px-3.5 font-normal no-underline";

export default function ReadmeBody({ onHire }: { onHire: () => void }) {
  return (
    <div className="flex h-full flex-col gap-2.5 overflow-y-auto bg-white px-4 py-3 font-ui text-black">
      <p className="m-0 text-lg font-bold">{siteMetadata.author} — integrations engineer</p>
      <p className="m-0 text-[13px] leading-normal">
        My code runs inside other people’s apps. Each window on this desktop is one of them,
        running a PageProof integration I built and shipped.
      </p>
      <p className="m-0 text-xs leading-normal text-[#404040]">{hosts}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <button type="button" onClick={onHire} className="x11-button h-7 px-3.5">
          Hire me
        </button>
        {hasServices && (
          <a href="/services/" className={linkButton}>
            Services
          </a>
        )}
        <a href={siteMetadata.cvUrl} target="_blank" rel="noopener noreferrer" className={linkButton}>
          CV.pdf
        </a>
      </div>
    </div>
  );
}
