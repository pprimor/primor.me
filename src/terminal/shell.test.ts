import { describe, expect, it } from "vitest";
import { experienceData, integrations, projects, skills } from "../lib/data";
import { siteMetadata } from "../lib/site-metadata";
import { commands, files, quickCommands } from "./commands";
import { linesToText, type Line } from "./lines";
import {
  complete,
  run,
  stepHistory,
  tokenize,
  type ShellContext,
} from "./shell";

const ctx: ShellContext = {
  content: { projects, experience: experienceData, skills, site: siteMetadata, integrations },
  history: ["help", "whoami"],
  now: () => new Date(2026, 9, 11, 9, 30),
};

function output(input: string): string {
  return linesToText(run(input, ctx).lines);
}

function hrefs(lines: readonly Line[]): string[] {
  return lines.flatMap((line) =>
    "segments" in line
      ? line.segments.flatMap((s) => (s.href ? [s.href] : []))
      : [],
  );
}

describe("tokenize", () => {
  it("splits on whitespace and trims", () => {
    expect(tokenize("  cat   about.txt ")).toEqual(["cat", "about.txt"]);
  });

  it("keeps quoted strings together", () => {
    expect(tokenize(`echo "hello world" 'a b'`)).toEqual([
      "echo",
      "hello world",
      "a b",
    ]);
  });

  it("returns no tokens for blank input", () => {
    expect(tokenize("   ")).toEqual([]);
  });
});

function segmentsOf(lines: readonly Line[]) {
  return lines.flatMap((line) => ("segments" in line ? line.segments : []));
}

describe("run", () => {
  it("ls shows an integrations folder you can click into", () => {
    expect(segmentsOf(run("ls", ctx).lines)).toContainEqual(
      expect.objectContaining({ text: "integrations/", run: "ls integrations" }),
    );
  });

  it("ls integrations lists every integration: windows open, the rest link out", () => {
    const result = run("ls integrations/", ctx);
    const text = linesToText(result.lines);
    for (const i of integrations) expect(text).toContain(i.id);
    expect(segmentsOf(result.lines)).toContainEqual(expect.objectContaining({ run: "open jira" }));
    const indesign = integrations.find((i) => i.id === "indesign")!;
    expect(hrefs(result.lines)).toContain(indesign.listing.url);
  });

  it("ls reports directories that don't exist", () => {
    expect(output("ls nope")).toContain("ls: cannot access 'nope': No such file or directory");
  });

  it("open asks the desktop to open a window", () => {
    expect(run("open jira", ctx).open).toBe("jira");
    expect(run("open README", ctx).open).toBe("readme");
    expect(run("open hire", ctx).open).toBe("hire");
  });

  it("open links to the listing for integrations without a window", () => {
    const result = run("open indesign", ctx);
    expect(result.open).toBeUndefined();
    const indesign = integrations.find((i) => i.id === "indesign")!;
    expect(hrefs(result.lines)).toContain(indesign.listing.url);
  });

  it("open reports unknown windows and missing operands", () => {
    expect(output("open nope")).toContain("open: nope: no such window");
    expect(output("open")).toContain("open: missing operand");
  });

  it("does nothing for blank input", () => {
    expect(run("  ", ctx)).toEqual({ lines: [] });
  });

  it("reports unknown commands the way bash does", () => {
    expect(output("rm -rf /")).toBe("bash: rm: command not found");
  });

  it("is case-insensitive for command names", () => {
    expect(output("WHOAMI")).toBe(output("whoami"));
  });

  it("help lists every visible command and no hidden ones", () => {
    const help = output("help");
    for (const command of commands.values()) {
      if (command.hidden) {
        expect(help).not.toMatch(new RegExp(`^  ${command.name} `, "m"));
      } else {
        expect(help).toContain(command.name);
      }
    }
  });

  it("help makes command names clickable", () => {
    const lines = run("help", ctx).lines;
    const runnable = lines.flatMap((line) =>
      "segments" in line ? line.segments.flatMap((s) => (s.run ? [s.run] : [])) : [],
    );
    expect(runnable).toContain("experience");
  });

  it("whoami gives name, title, employer and location", () => {
    const text = output("whoami");
    expect(text).toContain(siteMetadata.author);
    expect(text).toContain(siteMetadata.jobTitle);
    expect(text).toContain("PageProof");
    expect(text).toContain(siteMetadata.location);
  });

  it("experience lists every role with its date range", () => {
    const text = output("experience");
    for (const role of experienceData) {
      expect(text).toContain(role.company);
      expect(text).toContain(role.title);
    }
    expect(text).toContain("Mar. 2023 - Present");
  });

  it("projects lists titles and links", () => {
    const lines = run("projects", ctx).lines;
    for (const project of projects) {
      expect(linesToText(lines)).toContain(project.title);
      expect(hrefs(lines)).toContain(project.repoUrl);
      expect(hrefs(lines)).toContain(project.liveUrl);
    }
  });

  it("skills lists categories and additional skills", () => {
    const text = output("skills");
    expect(text).toContain("Backend & Cloud");
    expect(text).toContain("Azure Functions");
    expect(text).toContain("JavaScript");
  });

  it("contact links email and profiles", () => {
    const links = hrefs(run("contact", ctx).lines);
    expect(links).toContain(`mailto:${siteMetadata.contactEmail}`);
    expect(links).toContain(siteMetadata.profiles.github);
    expect(links).toContain(siteMetadata.profiles.linkedin);
  });

  it("cv links the CV", () => {
    expect(hrefs(run("cv", ctx).lines)).toContain(siteMetadata.cvUrl);
  });

  it("ls lists the virtual files", () => {
    const text = output("ls");
    for (const file of Object.keys(files)) {
      expect(text).toContain(file);
    }
  });

  it("cat prints the same output as the matching command", () => {
    expect(output("cat about.txt")).toBe(output("about"));
    expect(output("cat projects.txt")).toBe(output("projects"));
  });

  it("cat reports missing operands and files", () => {
    expect(output("cat")).toContain("missing operand");
    expect(output("cat nope.txt")).toContain(
      "nope.txt: No such file or directory",
    );
  });

  it("echo prints its arguments", () => {
    expect(output(`echo "hi there" you`)).toBe("hi there you");
  });

  it("history numbers previous commands", () => {
    const text = output("history");
    expect(text).toContain("1  help");
    expect(text).toContain("2  whoami");
  });

  it("date prints the current date", () => {
    expect(output("date")).toContain("2026");
  });

  it("clear asks the shell to clear", () => {
    expect(run("clear", ctx)).toEqual({ lines: [], clear: true });
  });

  it("hire asks the desktop to open the contact form", () => {
    const result = run("hire", ctx);
    expect(result.open).toBe("hire");
    expect(linesToText(result.lines)).toContain("Opening");
  });

  it("contact offers hire as a clickable command", () => {
    const segments = run("contact", ctx).lines.flatMap((l) =>
      "segments" in l ? l.segments : [],
    );
    expect(segments).toContainEqual(expect.objectContaining({ run: "hire" }));
  });

  it("exit asks the shell to close", () => {
    expect(run("exit", ctx)).toEqual({ lines: [], exit: true });
  });

  it("sudo refuses politely", () => {
    expect(output("sudo rm -rf /")).toContain("not in the sudoers file");
  });
});

describe("complete", () => {
  it("completes a unique command prefix with a trailing space", () => {
    expect(complete("exp")).toEqual({ value: "experience ", options: [] });
  });

  it("extends an ambiguous prefix to the common part and lists options", () => {
    const result = complete("c");
    expect(result.value).toBe("c");
    expect(result.options).toEqual(
      expect.arrayContaining(["cat", "clear", "contact", "cv"]),
    );
  });

  it("completes file names after cat", () => {
    expect(complete("cat sk")).toEqual({ value: "cat skills.txt", options: [] });
  });

  it("leaves input alone when nothing matches", () => {
    expect(complete("zzz")).toEqual({ value: "zzz", options: [] });
  });
});

describe("stepHistory", () => {
  const history = ["help", "whoami", "ls"];

  it("walks back from the live line to the newest entry", () => {
    expect(stepHistory(history, history.length, "up")).toEqual({
      cursor: 2,
      value: "ls",
    });
  });

  it("stops at the oldest entry", () => {
    expect(stepHistory(history, 0, "up")).toEqual({ cursor: 0, value: "help" });
  });

  it("walks forward back to an empty live line", () => {
    expect(stepHistory(history, 2, "down")).toEqual({ cursor: 3, value: "" });
  });
});

describe("quickCommands", () => {
  it("are visible commands that run cleanly, ending with hire", () => {
    expect(quickCommands.length).toBeGreaterThan(3);
    for (const name of quickCommands) {
      expect(commands.get(name)?.hidden).toBeFalsy();
      expect(output(name)).not.toMatch(/command not found/);
    }
    expect(quickCommands.at(-1)).toBe("hire");
  });
});
