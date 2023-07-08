"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = {
  "/": {
    label: "home",
  },
  "/about": {
    label: "about",
  },
  "/contact": {
    label: "contact",
  },
};

export default function Sidebar() {
  let activePath = usePathname() || "/";

  return (
    <aside className="mb-16">
      <div className="lg:sticky lg:top-20">
        <nav className="flex" id="nav">
          <div>
            {Object.entries(navItems).map(([path, { label }]) => {
              const isActive = activePath === path;
              return (
                <Link
                  key={path}
                  href={path}
                  className={clsx({
                    "text-neutral-500": !isActive,
                  })}
                >
                  <span className="relative py-1 pr-4">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
