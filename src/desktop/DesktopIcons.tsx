import type { MenuItem } from "./Panel";
import { isPlainLeftClick } from "../lib/link-intercept";
import { linkTargetProps } from "../lib/link-target";

const iconClass =
  "group flex w-20 flex-col items-center gap-1 p-1 text-center font-ui text-xs text-white focus-visible:outline-none";
const labelClass =
  "px-1 leading-tight [text-shadow:1px_1px_0_#000] group-hover:bg-[#000080] group-focus-visible:bg-[#000080] group-focus-visible:outline group-focus-visible:outline-1 group-focus-visible:outline-dotted group-focus-visible:outline-white";

export default function DesktopIcons({ items }: { items: readonly MenuItem[] }) {
  return (
    <ul
      aria-label="Desktop"
      className="absolute left-2 top-[calc(28px+0.75rem)] grid grid-flow-col grid-rows-[repeat(auto-fill,5rem)] gap-x-1 gap-y-2"
      style={{ maxHeight: "calc(100dvh - 28px - 1.5rem)" }}
    >
      {items.map((item) => (
        <li key={item.label}>
          {"href" in item ? (
            <a
              href={item.href}
              className={iconClass}
              {...linkTargetProps(item.href)}
              onClick={(event) => {
                if (item.onOpen && isPlainLeftClick(event)) {
                  event.preventDefault();
                  item.onOpen();
                }
              }}
            >
              {item.icon}
              <span className={labelClass}>{item.label}</span>
            </a>
          ) : (
            <button type="button" onClick={item.onSelect} className={iconClass}>
              {item.icon}
              <span className={labelClass}>{item.label}</span>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
