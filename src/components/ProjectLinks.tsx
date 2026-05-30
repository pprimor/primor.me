import { BsGithub } from "react-icons/bs";
import { HiExternalLink } from "react-icons/hi";

type ProjectLinksProps = {
  liveUrl?: string;
  repoUrl?: string;
  className?: string;
};

export default function ProjectLinks({
  liveUrl,
  repoUrl,
  className = "",
}: ProjectLinksProps) {
  if (!liveUrl && !repoUrl) {
    return null;
  }

  const linkClassName =
    "inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 underline-offset-2 hover:underline focus-ring rounded dark:text-gray-300";

  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`}>
      {liveUrl && (
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          Live demo
          <HiExternalLink className="text-xs opacity-70" />
        </a>
      )}
      {repoUrl && (
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          Source code
          <BsGithub className="text-sm opacity-70" />
        </a>
      )}
    </div>
  );
}
