import { SERVICES_PATH, servicePath } from "../lib/service-paths";
import { calculateDuration, formatDateRange } from "../lib/utils";
import { blank, cmd, hanging, line, link, tone, type Line } from "./lines";
import type { Command, RunResult, ShellContext } from "./types";

function out(lines: Line[]): RunResult {
  return { lines };
}

function error(message: string): RunResult {
  return out([line(tone(message, "error"))]);
}

function heading(text: string): Line {
  return line(tone(text, "heading"));
}

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

const whoami: Command = {
  name: "whoami",
  summary: "who I am, in one breath",
  run: (_args, { content: { site } }) =>
    out([
      line(tone(site.author, "heading"), " — ", site.jobTitle, " at ", link(site.worksFor.name, site.worksFor.url), ", ", site.location, "."),
      line("I build integrations and workflow tools for creative teams:"),
      line("Canva, Adobe, Office and Final Cut Pro. Open to select freelance projects."),
    ]),
};

const about: Command = {
  name: "about",
  summary: "a longer introduction",
  run: () =>
    out([
      heading("About"),
      line("Software Engineer at PageProof, designing and building cross-platform"),
      line("integrations for Canva, Microsoft Office, Adobe Creative Suite and"),
      line("Final Cut Pro. I work mostly in React, TypeScript, Swift and Electron,"),
      line("across web, desktop and mobile."),
      blank,
      line("I build integrations and workflow extensions that connect creative"),
      line("ecosystems: turning complex technical requirements into tools that feel"),
      line("simple, and that stay maintainable as they grow."),
    ]),
};

const experience: Command = {
  name: "experience",
  summary: "where I've worked",
  run: (_args, { content }) => {
    const lines: Line[] = [heading("Experience")];
    for (const role of content.experience) {
      const duration = calculateDuration(role.startDate, role.endDate);
      lines.push(
        blank,
        line(
          tone(role.title, "accent"),
          " @ ",
          role.companyUrl ? link(role.company, role.companyUrl) : role.company,
        ),
        line(
          tone(
            [formatDateRange(role.startDate, role.endDate), duration, role.employmentType, role.location]
              .filter(Boolean)
              .join(" · "),
            "muted",
          ),
        ),
        ...role.description.map((bullet) => hanging(4, "  - ", bullet)),
      );
      for (const plugin of role.plugins ?? []) {
        lines.push(hanging(4, "  ↳ ", link(plugin.name, plugin.url)));
      }
    }
    return out(lines);
  },
};

const projects: Command = {
  name: "projects",
  summary: "things I've built",
  run: (_args, { content }) => {
    const lines: Line[] = [heading("Projects")];
    for (const project of content.projects) {
      lines.push(
        blank,
        line(tone(project.title, "accent")),
        line(project.description),
        line(tone(project.tags.join(" · "), "muted")),
        line("  live  ", link(displayUrl(project.liveUrl), project.liveUrl)),
        line("  repo  ", link(displayUrl(project.repoUrl), project.repoUrl)),
      );
    }
    return out(lines);
  },
};

const skills: Command = {
  name: "skills",
  summary: "what I work with",
  run: (_args, { content }) => {
    const { categories, additional } = content.skills;
    const width = Math.max(...categories.map((c) => c.category.length)) + 2;
    return out([
      heading("Skills"),
      ...categories.map((c) =>
        hanging(width, tone(c.category.padEnd(width), "muted"), c.skills.join(", ")),
      ),
      hanging(width, tone("Also".padEnd(width), "muted"), additional.join(", ")),
    ]);
  },
};

const contact: Command = {
  name: "contact",
  summary: "how to reach me",
  run: (_args, { content: { site } }) =>
    out([
      line("  email     ", link(site.contactEmail, `mailto:${site.contactEmail}`)),
      line("  github    ", link(displayUrl(site.profiles.github), site.profiles.github)),
      line("  linkedin  ", link(displayUrl(site.profiles.linkedin), site.profiles.linkedin)),
      blank,
      line("Or run ", cmd("hire"), " to send a message from here."),
    ]),
};

const services: Command = {
  name: "services",
  summary: "what I can build for you",
  run: (_args, { content }) => {
    const width = Math.max(...content.services.map((s) => s.name.length)) + 2;
    return out([
      heading("Services"),
      ...content.services.map((s) =>
        hanging(
          2 + width,
          "  ",
          link(s.name, servicePath(s.slug)),
          " ".repeat(width - s.name.length),
          tone(s.summary, "muted"),
        ),
      ),
      blank,
      line("  ", link("All services and a contact form", SERVICES_PATH)),
    ]);
  },
};

const hire: Command = {
  name: "hire",
  summary: "tell me about your project",
  run: () => ({ lines: [line(tone("Opening the contact form…", "muted"))], open: "hire" }),
};

const cv: Command = {
  name: "cv",
  summary: "download my CV (PDF)",
  run: (_args, { content: { site } }) =>
    out([line("  ", link(displayUrl(site.cvUrl), site.cvUrl))]),
};

/** Virtual files: `cat <file>` prints the matching command's output. */
export const files: Record<string, Command> = {
  "about.txt": about,
  "experience.txt": experience,
  "projects.txt": projects,
  "skills.txt": skills,
  "services.txt": services,
  "contact.txt": contact,
};

const ls: Command = {
  name: "ls",
  summary: "list files",
  run: () =>
    out([line(...Object.keys(files).flatMap((f, i) => [i ? "  " : "", { text: f, run: `cat ${f}`, tone: "accent" as const }]))]),
};

const cat: Command = {
  name: "cat",
  summary: "print a file",
  run: (args, ctx) => {
    if (args.length === 0) return error("cat: missing operand — try 'ls'");
    const lines: Line[] = [];
    for (const name of args) {
      const file = files[name];
      lines.push(
        ...(file
          ? file.run([], ctx).lines
          : [line(tone(`cat: ${name}: No such file or directory`, "error"))]),
      );
    }
    return out(lines);
  },
};

const echo: Command = {
  name: "echo",
  summary: "print text",
  hidden: true,
  run: (args) => out([line(args.join(" "))]),
};

const date: Command = {
  name: "date",
  summary: "print the date",
  hidden: true,
  run: (_args, ctx) => out([line(ctx.now().toString())]),
};

const history: Command = {
  name: "history",
  summary: "commands you've run",
  run: (_args, ctx) =>
    out(
      ctx.history.map((entry, i) =>
        line(tone(String(i + 1).padStart(4), "muted"), "  ", entry),
      ),
    ),
};

const clear: Command = {
  name: "clear",
  summary: "clear the screen",
  run: () => ({ lines: [], clear: true }),
};

const exit: Command = {
  name: "exit",
  summary: "close the terminal",
  hidden: true,
  run: () => ({ lines: [], exit: true }),
};

const sudo: Command = {
  name: "sudo",
  summary: "nice try",
  hidden: true,
  run: () => error("guest is not in the sudoers file. This incident will be reported."),
};

const help: Command = {
  name: "help",
  summary: "show this list",
  run: () => {
    const visible = registry.filter((c) => !c.hidden);
    const width = Math.max(...visible.map((c) => c.name.length)) + 2;
    return out([
      line("Available commands:"),
      ...visible.map((c) =>
        hanging(2 + width, "  ", cmd(c.name), " ".repeat(width - c.name.length), tone(c.summary, "muted")),
      ),
      blank,
      line(tone("Tab completes, ↑/↓ walks history, Ctrl+L clears. Commands are clickable.", "muted")),
    ]);
  },
};

const registry: readonly Command[] = [
  help, whoami, about, experience, projects, skills, contact, services, hire, cv,
  ls, cat, history, clear, echo, date, exit, sudo,
];

export const commands: ReadonlyMap<string, Command> = new Map(
  registry.map((c) => [c.name, c]),
);

export const commandNames = registry.map((c) => c.name);

export type { ShellContext };

/** Tappable shortcuts shown under the terminal on small screens. */
export const quickCommands = ["about", "experience", "projects", "skills", "contact", "cv", "hire"] as const;
